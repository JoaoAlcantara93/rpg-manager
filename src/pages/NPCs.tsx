// src/pages/NPCs.tsx - Versão Padronizada
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dices, 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  Heart,
  Shield,
  Eye,
  Brain,
  Sword,
  Zap,
  ChevronRight,
  Activity,
  ScrollText,
  Wand2,
  Swords as SwordIcon
} from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Npc {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  attributes: any;
  spells: any;
  current_hp?: number | null;
  max_hp?: number | null;
  armor_class?: number | null;
  fortitude_save?: number | null;
  reflex_save?: number | null;
  will_save?: number | null;
  perception?: number | null;
  attacks?: string | null;
  image_url?: string | null;
  observation?: string | null;
  created_at: string;
  updated_at: string;
}

const NPCs = () => {
  const navigate = useNavigate();
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    attributes: "",
    spells: "",
    current_hp: "",
    max_hp: "",
    armor_class: "10",
    fortitude_save: "0",
    reflex_save: "0",
    will_save: "0",
    perception: "0",
    attacks: "",
    image_url: "",
    observation: ""
  });

  const [showEmptyCard] = useState(true);

  useEffect(() => {
    const campaignId = localStorage.getItem('current-campaign');
    setCurrentCampaignId(campaignId);
    
    if (campaignId) {
      fetchNpcs(campaignId);
    } else {
      toast.error("Nenhuma campanha selecionada");
      setLoading(false);
    }
  }, []);

  const fetchNpcs = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('npcs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNpcs(data || []);
    } catch (error) {
      console.error("Erro ao carregar NPCs:", error);
      toast.error("Erro ao carregar NPCs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentCampaignId) {
        toast.error("Nenhuma campanha selecionada");
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      const npcData = {
        campaign_id: currentCampaignId,
        user_id: user.id,
        name: formData.name,
        attributes: formData.attributes || "",
        spells: formData.spells || "",
        current_hp: parseInt(formData.current_hp) || 0,
        max_hp: parseInt(formData.max_hp) || 0,
        armor_class: parseInt(formData.armor_class) || 10,
        fortitude_save: parseInt(formData.fortitude_save) || 0,
        reflex_save: parseInt(formData.reflex_save) || 0,
        will_save: parseInt(formData.will_save) || 0,
        perception: parseInt(formData.perception) || 0,
        attacks: formData.attacks,
        image_url: formData.image_url,
        observation: formData.observation
      };

      let result;
      if (editingNpc) {
        const { data, error } = await supabase
          .from('npcs')
          .update(npcData)
          .eq('id', editingNpc.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        setNpcs(npcs.map(npc => npc.id === editingNpc.id ? data : npc));
        toast.success("NPC atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('npcs')
          .insert([npcData])
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        setNpcs([result, ...npcs]);
        toast.success("NPC criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar NPC:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleEdit = (npc: Npc) => {
    setEditingNpc(npc);
    setFormData({
      name: npc.name,
      attributes: typeof npc.attributes === 'string' ? npc.attributes : 
                 npc.attributes ? JSON.stringify(npc.attributes, null, 2) : "",
      spells: typeof npc.spells === 'string' ? npc.spells : 
              npc.spells ? JSON.stringify(npc.spells, null, 2) : "",
      current_hp: (npc.current_hp || 0).toString(),
      max_hp: (npc.max_hp || 0).toString(),
      armor_class: (npc.armor_class || 10).toString(),
      fortitude_save: (npc.fortitude_save || 0).toString(),
      reflex_save: (npc.reflex_save || 0).toString(),
      will_save: (npc.will_save || 0).toString(),
      perception: (npc.perception || 0).toString(),
      attacks: npc.attacks || "",
      image_url: npc.image_url || "",
      observation: npc.observation || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este NPC?")) return;

    try {
      const { error } = await supabase
        .from('npcs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNpcs(npcs.filter(npc => npc.id !== id));
      toast.success("NPC excluído com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  };

  const handleQuickHeal = async (npcId: string, amount: number) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;
    
    const newHp = Math.min(
      (npc.current_hp || 0) + amount,
      npc.max_hp || 0
    );
    
    await updateNpcHP(npcId, newHp);
    toast.success(`${npc.name} curado em ${amount} HP`);
  };

  const handleQuickDamage = async (npcId: string, amount: number) => {
    const npc = npcs.find(n => n.id === npcId);
    if (!npc) return;
    
    const newHp = Math.max(0, (npc.current_hp || 0) - amount);
    
    await updateNpcHP(npcId, newHp);
    toast.warning(`${npc.name} sofreu ${amount} de dano`);
    
    if (newHp < (npc.max_hp || 1) * 0.25) {
      toast.error(`${npc.name} está em estado crítico!`);
    }
  };

  const updateNpcHP = async (npcId: string, newHp: number) => {
    try {
      const { error } = await supabase
        .from('npcs')
        .update({ current_hp: newHp })
        .eq('id', npcId);

      if (error) throw error;
      
      setNpcs(npcs.map(n => 
        n.id === npcId ? { ...n, current_hp: newHp } : n
      ));
    } catch (error) {
      toast.error("Erro ao atualizar HP");
    }
  };

  const exportToCombat = () => {
    const combatData = npcs.map(n => ({
      name: n.name,
      hp_current: n.current_hp,
      hp_max: n.max_hp,
      ac: n.armor_class,
      perception: n.perception,
      initiative: 0
    }));
    
    localStorage.setItem('combat-npc-export', JSON.stringify(combatData));
    navigate('/initiative');
    toast.success('NPCs exportados para o combate!');
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      attributes: "", 
      spells: "",
      current_hp: "",
      max_hp: "",
      armor_class: "10",
      fortitude_save: "0",
      reflex_save: "0",
      will_save: "0",
      perception: "0",
      attacks: "",
      image_url: "",
      observation: ""
    });
    setEditingNpc(null);
  };

  const getHealthPercentage = (npc: Npc) => {
    if (!npc.max_hp) return 0;
    return ((npc.current_hp || 0) / npc.max_hp) * 100;
  };

  const getHealthColor = (percentage: number) => {
    if (percentage > 75) return "from-green-500 to-green-400";
    if (percentage > 25) return "from-yellow-500 to-yellow-400";
    return "from-red-500 to-red-400";
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Dices className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando NPCs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  NPCs
                </span>
              </h2>
              <p className="text-muted-foreground">Gerencie os personagens não-jogadores</p>
            </div>
          </div>
        </div>
        
       
        
        {/* LISTA DE NPCS */}
        {npcs.length === 0 ? (
          /* ESTADO VAZIO - Sem NPCs */
          <div className="max-w-md mx-auto">
            <div 
              onClick={() => setDialogOpen(true)}
              className="border-3 border-dashed border-border hover:border-accent/50 bg-gradient-to-br from-card/30 to-card/10 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer group min-h-[400px] flex flex-col items-center justify-center p-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Users className="w-10 h-10 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                  Adicionar Primeiro NPC
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Comece a gerenciar personagens não-jogadores da sua campanha
                </p>
                
                <div className="bg-card/50 border border-border rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Exemplo de informações úteis:</p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-primary/10 rounded">
                      <div className="font-bold">CA</div>
                      <div>12-16</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/10 rounded">
                      <div className="font-bold">HP</div>
                      <div>15-30</div>
                    </div>
                    <div className="text-center p-2 bg-accent/10 rounded">
                      <div className="font-bold">PER</div>
                      <div>+2-4</div>
                    </div>
                  </div>
                </div>
                
                <button className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center mx-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro NPC
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* COM NPCS - Grid com cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card vazio para adicionar novo - SEMPRE no início */}
            {showEmptyCard && (
              <div 
                onClick={() => setDialogOpen(true)}
                className="border-2 border-dashed border-border hover:border-accent/50 bg-gradient-to-br from-card/30 to-card/10 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer group min-h-[300px] flex flex-col items-center justify-center order-first"
              >
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-accent transition-colors">
                    Novo NPC
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Clique para adicionar um novo NPC à campanha
                  </p>
                  
                  <div className="mt-6 text-xs text-muted-foreground">
                    <p className="mb-1">Dica rápida:</p>
                    <ul className="space-y-1 text-left">
                      <li className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        <span>Comece apenas com nome e HP</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        <span>Adicione detalhes durante o jogo</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* NPCs existentes */}
          
            {npcs.map((npc) => {
              const healthPercentage = getHealthPercentage(npc);
              
              return (
                <div 
                  key={npc.id} 
                  className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-xl hover:border-accent/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden flex flex-col min-h-[450px]"
                >
                  {/* Banner com imagem grande no topo */}
                  <div className="relative h-32 bg-gradient-to-r from-muted/30 to-muted/10 overflow-hidden">
                    {npc.image_url ? (
                      <img 
                        src={npc.image_url} 
                        alt={npc.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback') as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${npc.image_url ? 'hidden' : ''} image-fallback w-full h-full flex items-center justify-center`}>
                      <Users className="w-16 h-16 text-muted-foreground/20" />
                    </div>
                    
                    {/* Overlay escuro para contraste do texto */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16"></div>
                    
                    {/* Nome sobre a imagem */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          healthPercentage > 75 ? 'bg-green-500' :
                          healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <h3 className="text-xl font-bold text-white truncate">{npc.name}</h3>
                      </div>
                    </div>
                    
                    {/* Botões de ação no canto superior direito */}
                    <div className="absolute top-3 right-3 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickHeal(npc.id, 5);
                        }}
                        className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg transition-colors backdrop-blur-sm"
                        title="Curar 5 HP"
                      >
                        +5
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickDamage(npc.id, 5);
                        }}
                        className="p-1.5 bg-black/40 hover:bg-black/60 text-destructive rounded-lg transition-colors backdrop-blur-sm"
                        title="Causar 5 de dano"
                      >
                        -5
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(npc);
                        }}
                        className="p-1.5 bg-black/40 hover:bg-black/60 text-primary rounded-lg transition-colors backdrop-blur-sm"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Conteúdo abaixo da imagem */}
                  <div className="p-6 flex-1">
                    
                    {/* Barra de HP Visual */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-destructive" />
                          <span className="text-muted-foreground">Vitalidade</span>
                        </div>
                        <span className="font-medium">
                          {npc.current_hp || 0}/{npc.max_hp || 0}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({Math.round(((npc.current_hp || 0) / (npc.max_hp || 1)) * 100)}%)
                          </span>
                        </span>
                      </div>
                      
                      <div className="relative h-2 w-full bg-red-500/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-400/20"></div>
                        
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 rounded-full"
                          style={{ 
                            width: `${Math.max(3, ((npc.current_hp || 0) / (npc.max_hp || 1)) * 100)}%` 
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                    

                                {/* Estatísticas Rápidas */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Shield className="w-3 h-3 text-primary" />
                                      <div className="text-xs text-muted-foreground">CA</div>
                                    </div>
                                    <div className="text-lg font-bold bg-primary/10 py-1 rounded">{npc.armor_class || 10}</div>
                                  </div>
                                  
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Eye className="w-3 h-3 text-secondary" />
                                      <div className="text-xs text-muted-foreground">PER</div>
                                    </div>
                                    <div className="text-lg font-bold bg-secondary/10 py-1 rounded">+{npc.perception || 0}</div>
                                  </div>
                                  
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Brain className="w-3 h-3 text-accent" />
                                      <div className="text-xs text-muted-foreground">VON</div>
                                    </div>
                                    <div className="text-lg font-bold bg-accent/10 py-1 rounded">+{npc.will_save || 0}</div>
                                  </div>
                                </div>
                                
                                {/* Salvaguardas Secundárias */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Fortitude</div>
                                    <div className="text-sm font-medium bg-green-500/10 text-green-500 py-1 rounded">
                                      +{npc.fortitude_save || 0}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">Reflexos</div>
                                    <div className="text-sm font-medium bg-blue-500/10 text-blue-500 py-1 rounded">
                                      +{npc.reflex_save || 0}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Informações Específicas de NPC */}
                                {npc.attacks && (
                                  <div className="mb-3">
                                    <div className="flex items-center gap-1 mb-1">
                                      <SwordIcon className="w-3 h-3 text-destructive" />
                                      <span className="text-xs text-muted-foreground">Ataques</span>
                                    </div>
                                    <p className="text-sm bg-destructive/10 p-2 rounded border border-destructive/20">
                                      {npc.attacks}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Atributos */}
                                {npc.attributes && (
                                  <div className="mb-3">
                                    <div className="flex items-center gap-1 mb-1">
                                      <ScrollText className="w-3 h-3 text-blue-500" />
                                      <span className="text-xs text-muted-foreground">Atributos</span>
                                    </div>
                                    <p className="text-sm bg-blue-500/10 p-2 rounded border border-blue-500/20 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                      {typeof npc.attributes === 'string' ? npc.attributes : JSON.stringify(npc.attributes, null, 2)}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Magias */}
                                {npc.spells && (
                                  <div className="mb-3">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Wand2 className="w-3 h-3 text-purple-500" />
                                      <span className="text-xs text-muted-foreground">Magias</span>
                                    </div>
                                    <p className="text-sm bg-purple-500/10 p-2 rounded border border-purple-500/20 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                      {typeof npc.spells === 'string' ? npc.spells : JSON.stringify(npc.spells, null, 2)}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Anotações do Mestre */}
                                {npc.observation && (
                                  <details className="group mt-3">
                                    <summary className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1 hover:text-foreground transition-colors">
                                      <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                                      Notas do Mestre
                                    </summary>
                                    <div className="mt-2 text-sm bg-muted/30 p-3 rounded border border-border">
                                      {npc.observation}
                                    </div>
                                  </details>
                                )}
                                
                                {/* Tags de Identificação */}
                                <div className="mt-4 flex flex-wrap gap-1">
                                  {npc.max_hp && npc.max_hp > 40 && (
                                    <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">Resistente</span>
                                  )}
                                  {npc.perception && npc.perception > 4 && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">Vigilante</span>
                                  )}
                                  {npc.will_save && npc.will_save > 4 && (
                                    <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full">Focado</span>
                                  )}
                                  {npc.attacks && (
                                    <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full">Agressivo</span>
                                  )}
                                  {npc.spells && (
                                    <span className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full">Mágico</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Footer com Ações */}
                              <div className="border-t border-border bg-card/50 px-4 py-3 mt-auto flex justify-between">
                                <button
                                  onClick={() => exportToCombat()}
                                  className="text-xs px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Sword className="w-3 h-3" />
                                  Combate
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Excluir ${npc.name}?`)) {
                                      handleDelete(npc.id);
                                    }
                                  }}
                                  className="text-xs px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Excluir
                                </button>
                              </div>
                            </div>
                          );
                })}
          </div>
        )}
        
        {/* FAB para Mobile */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setDialogOpen(true)}
            className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 animate-pulse-subtle"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      
      {/* Modal de Adicionar/Editar */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-border bg-gradient-to-r from-card to-card/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {editingNpc ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {editingNpc ? "Editar NPC" : "Novo NPC"}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {editingNpc ? "Atualize os dados do NPC" : "Preencha os dados do novo NPC"}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Seção: Identificação */}
              <div className="space-y-4">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Identificação
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nome *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      placeholder="Nome do NPC"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="armor_class" className="block text-sm font-medium text-foreground mb-2">
                      Classe de Armadura (CA)
                    </label>
                    <input
                      id="armor_class"
                      type="number"
                      value={formData.armor_class}
                      onChange={(e) => setFormData({ ...formData, armor_class: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="perception" className="block text-sm font-medium text-foreground mb-2">
                      Percepção
                    </label>
                    <input
                      id="perception"
                      type="number"
                      value={formData.perception}
                      onChange={(e) => setFormData({ ...formData, perception: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção: Vitalidade */}
              <div className="space-y-4">
                <h4 className="font-semibold text-destructive flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Vitalidade
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="current_hp" className="block text-sm font-medium text-foreground mb-2">
                      HP Atual
                    </label>
                    <input
                      id="current_hp"
                      type="number"
                      value={formData.current_hp}
                      onChange={(e) => setFormData({ ...formData, current_hp: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="max_hp" className="block text-sm font-medium text-foreground mb-2">
                      HP Máximo
                    </label>
                    <input
                      id="max_hp"
                      type="number"
                      value={formData.max_hp}
                      onChange={(e) => setFormData({ ...formData, max_hp: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção: Defesas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-secondary flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Defesas
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="fortitude_save" className="block text-sm font-medium text-foreground mb-2">
                      Fortitude
                    </label>
                    <input
                      id="fortitude_save"
                      type="number"
                      value={formData.fortitude_save}
                      onChange={(e) => setFormData({ ...formData, fortitude_save: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="reflex_save" className="block text-sm font-medium text-foreground mb-2">
                      Reflexos
                    </label>
                    <input
                      id="reflex_save"
                      type="number"
                      value={formData.reflex_save}
                      onChange={(e) => setFormData({ ...formData, reflex_save: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="will_save" className="block text-sm font-medium text-foreground mb-2">
                      Vontade
                    </label>
                    <input
                      id="will_save"
                      type="number"
                      value={formData.will_save}
                      onChange={(e) => setFormData({ ...formData, will_save: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {/* Seção: Ataques e Habilidades */}
              <div className="space-y-4">
                <h4 className="font-semibold text-accent flex items-center gap-2">
                  <SwordIcon className="w-4 h-4" />
                  Ataques e Habilidades
                </h4>
                <div>
                  <label htmlFor="attacks" className="block text-sm font-medium text-foreground mb-2">
                    Ataques
                  </label>
                  <textarea
                    id="attacks"
                    value={formData.attacks}
                    onChange={(e) => setFormData({ ...formData, attacks: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                    placeholder="Ex: Espada Longa: +5 para acertar, 1d8+2 cortante
  Arco Curto: +4 para acertar, 1d6+1 perfurante (alcance 24m/96m)"
                  />
                </div>
                
                <div>
                  <label htmlFor="attributes" className="block text-sm font-medium text-foreground mb-2">
                    Atributos
                  </label>
                  <textarea
                    id="attributes"
                    value={formData.attributes}
                    onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                    placeholder="Força: 10
  Destreza: 12
  Constituição: 14
  Inteligência: 8
  Sabedoria: 10
  Carisma: 16"
                  />
                </div>
                
                <div>
                  <label htmlFor="spells" className="block text-sm font-medium text-foreground mb-2">
                    Magias e Habilidades Especiais
                  </label>
                  <textarea
                    id="spells"
                    value={formData.spells}
                    onChange={(e) => setFormData({ ...formData, spells: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                    placeholder="Bola de Fogo (3/dia): 8d6 de dano de fogo, CD 15
  Cura Moderada (2/dia): 3d8+4 pontos de vida
  Invisibilidade (1/dia): Duração 1 hora"
                  />
                </div>
              </div>
              
              {/* Seção: Anotações e Imagem */}
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-500 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Anotações e Aparência
                </h4>
                
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-foreground mb-2">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="https://exemplo.com/imagem-npc.jpg"
                  />
                </div>
                
                <div>
                  <label htmlFor="observation" className="block text-sm font-medium text-foreground mb-2">
                    Observações do Mestre
                  </label>
                  <textarea
                    id="observation"
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-32 resize-none"
                    placeholder="Personalidade, motivações, segredos, conexões com a história..."
                  />
                </div>
              </div>
              
              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground rounded-lg transition-all font-medium"
                >
                  {editingNpc ? "Atualizar NPC" : "Criar NPC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NPCs;