// src/pages/NPCs.tsx - Versão com TextArea Simples
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dices, ArrowLeft, Plus, Pencil, Trash2, Users, User, BookOpen, Swords, MapPin, Book, Zap, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Interface compatível com o Supabase
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
    armor_class: "",
    fortitude_save: "",
    reflex_save: "",
    will_save: "",
    perception: "",
    attacks: "",
    image_url: "",
    observation: ""
  });

  const menuItems = [
    {
      title: "Aventureiros",
      description: "Gerencie seus jogadores",
      icon: User,
      path: "/players",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Anotações",
      description: "Gerencie suas anotações",
      icon: BookOpen,
      path: "/dashboard",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Combate",
      description: "Gerencie os combates",
      icon: Swords,
      path: "/initiative",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Mapas",
      description: "Consule mapas",
      icon: MapPin,
      path: "*",
      gradient: "from-secondary to-accent",
    },   
    {
      title: "Regras",
      description: "Em desenvolvimento - Em breve!", 
      icon: Book,
      path: "#",
      gradient: "from-secondary to-accent", 
      disabled: true
    },
  ];

  useEffect(() => {
    const campaignId = localStorage.getItem('current-campaign');
    console.log("🎯 Campaign ID do localStorage:", campaignId);
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
      console.log("🔄 Buscando NPCs para campanha:", campaignId);
      
      const { data, error } = await supabase
        .from('npcs')
        .select(`
          id,
          campaign_id,
          user_id,
          name,
          attributes,
          spells,
          current_hp,
          max_hp,
          armor_class,
          fortitude_save,
          reflex_save,
          will_save,
          perception,
          attacks,
          image_url,
          observation,
          created_at,
          updated_at
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Erro ao carregar NPCs:", error);
        throw error;
      }

      console.log("✅ NPCs carregados:", data);
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

      console.log("💾 Iniciando salvamento do NPC...");

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("❌ Erro de autenticação:", authError);
        throw new Error("Usuário não autenticado");
      }

      if (!user) {
        console.error("❌ Nenhum usuário autenticado");
        throw new Error("Usuário não autenticado");
      }

      console.log("👤 Usuário autenticado:", user.id);

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

      console.log("📤 Dados a serem enviados para o Supabase:", npcData);

      if (editingNpc) {
        const { data, error } = await supabase
          .from('npcs')
          .update(npcData)
          .eq('id', editingNpc.id)
          .select(`
            id,
            campaign_id,
            user_id,
            name,
            attributes,
            spells,
            current_hp,
            max_hp,
            armor_class,
            fortitude_save,
            reflex_save,
            will_save,
            perception,
            attacks,
            image_url,
            observation,
            created_at,
            updated_at
          `)
          .single();

        if (error) {
          console.error("❌ Erro ao atualizar NPC:", error);
          throw error;
        }

        console.log("✅ NPC atualizado:", data);
        
        setNpcs(npcs.map(npc => 
          npc.id === editingNpc.id ? data : npc
        ));
        toast.success("NPC atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('npcs')
          .insert([npcData])
          .select(`
            id,
            campaign_id,
            user_id,
            name,
            attributes,
            spells,
            current_hp,
            max_hp,
            armor_class,
            fortitude_save,
            reflex_save,
            will_save,
            perception,
            attacks,
            image_url,
            observation,
            created_at,
            updated_at
          `)
          .single();

        if (error) {
          console.error("❌ Erro ao criar NPC:", error);
          throw error;
        }

        console.log("✅ NPC criado:", data);
        
        setNpcs([data, ...npcs]);
        toast.success("NPC criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("❌ Erro ao salvar NPC:", error);
      toast.error(`Erro ao salvar NPC: ${error.message}`);
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
      console.log("🗑️ Excluindo NPC:", id);
      const { error } = await supabase
        .from('npcs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("❌ Erro ao excluir NPC:", error);
        throw error;
      }

      setNpcs(npcs.filter(npc => npc.id !== id));
      toast.success("NPC excluído com sucesso!");
    } catch (error: any) {
      console.error("❌ Erro ao excluir NPC:", error);
      toast.error(`Erro ao excluir NPC: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      attributes: "", 
      spells: "",
      current_hp: "",
      max_hp: "",
      armor_class: "",
      fortitude_save: "",
      reflex_save: "",
      will_save: "",
      perception: "",
      attacks: "",
      image_url: "",
      observation: ""
    });
    setEditingNpc(null);
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 
                            border border-primary/20">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent 
                                 bg-clip-text text-transparent">
                    NPCs
                  </span>
                </h2>
                <p className="text-muted-foreground">Gerencie seus personagens</p>
              </div>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
             className="px-6 py-3 bg-gradient-to-r from-secondary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo NPC
            </button>
           
          </div>
          
            
          {/* Lista de NPCs */}
          {npcs.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-lg bg-card/50">
              <div className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum NPC criado ainda</p>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center mx-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro NPC
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {npcs.map((npc) => (
                <div 
                  key={npc.id} 
                  className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-lg hover:border-accent/50 transition-all shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Imagem do personagem - lado esquerdo */}
                      <div className="flex-shrink-0">
                        {npc.image_url ? (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
                            <img 
                              src={npc.image_url} 
                              alt={npc.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback') as HTMLElement;
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden image-fallback w-full h-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                              <Users className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border-2 border-border">
                            <Users className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      
                      {/* Informações do personagem - lado direito */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-foreground">{npc.name}</h3>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(npc);
                              }}
                              className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/20 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(npc.id);
                              }}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Status básicos em linha */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">HP:</span>
                            <span className="text-foreground font-medium">{npc.current_hp || 0}/{npc.max_hp || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">CA:</span>
                            <span className="text-foreground font-medium">{npc.armor_class || 10}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Per:</span>
                            <span className="text-foreground font-medium">{npc.perception || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      {/* Status Básicos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Fort:</span>
                          <span className="text-foreground">{npc.fortitude_save || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Ref:</span>
                          <span className="text-foreground">{npc.reflex_save || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Von:</span>
                          <span className="text-foreground">{npc.will_save || 0}</span>
                        </div>                     
                      </div>
  
                      {/* Observações */}
                      {npc.observation && (
                        <div>
                          <p className="text-muted-foreground mb-1">Observações:</p>
                          <p className="text-foreground text-xs bg-accent/10 p-2 rounded whitespace-pre-wrap">
                            {npc.observation}
                          </p>
                        </div>
                      )}
  
                      {/* Ataques */}
                      {npc.attacks && (
                        <div>
                          <p className="text-muted-foreground mb-1">Ataques:</p>
                          <p className="text-foreground text-xs bg-accent/10 p-2 rounded whitespace-pre-wrap">
                            {npc.attacks}
                          </p>
                        </div>
                      )}
  
                      {/* Atributos */}
                      {npc.attributes && (
                        <div>
                          <p className="text-muted-foreground mb-1">Atributos:</p>
                          <p className="text-foreground text-xs bg-accent/10 p-2 rounded whitespace-pre-wrap">
                            {typeof npc.attributes === 'string' ? npc.attributes : JSON.stringify(npc.attributes, null, 2)}
                          </p>
                        </div>
                      )}
  
                      {/* Magias */}
                      {npc.spells && (
                        <div>
                          <p className="text-muted-foreground mb-1">Magias:</p>
                          <p className="text-foreground text-xs bg-accent/10 p-2 rounded whitespace-pre-wrap">
                            {typeof npc.spells === 'string' ? npc.spells : JSON.stringify(npc.spells, null, 2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  
       {/* Sidebar com Acesso Rápido - CORRIGIDO PARA O PADRÃO DOS OUTROS */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
          <Card className="border-2 border-border bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                <span>Acesso Rápido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 
                             bg-card/50 hover:bg-card transition-all duration-300
                             hover:shadow-[0_4px_12px_hsl(var(--primary)_/_0.1)] cursor-pointer
                             group"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} 
                                    group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary 
                                             group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          </div>
        </div>
        </div>
  
      {/* Modal de Adicionar/Editar NPC */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">
                {editingNpc ? "Editar NPC" : "Novo NPC"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Preencha os dados do NPC
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
  
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nome do NPC"
                    />
                  </div>
                </div>

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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="armor_class" className="block text-sm font-medium text-foreground mb-2">
                      CA
                    </label>
                    <input
                      id="armor_class"
                      type="number"
                      value={formData.armor_class}
                      onChange={(e) => setFormData({ ...formData, armor_class: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-foreground mb-2">
                    URL da Imagem
                  </label>
                  <input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div>
                  <label htmlFor="attacks" className="block text-sm font-medium text-foreground mb-2">
                    Ataques
                  </label>
                  <textarea
                    id="attacks"
                    value={formData.attacks}
                    onChange={(e) => setFormData({ ...formData, attacks: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                    placeholder="Descreva os ataques do NPC..."
                  />
                </div>

                <div>
                  <label htmlFor="observation" className="block text-sm font-medium text-foreground mb-2">
                    Observações
                  </label>
                  <textarea
                    id="observation"
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                    placeholder="Observações sobre o NPC..."
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
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                    placeholder="Força: 10
  Destreza: 12
  Constituição: 14
  Inteligência: 8
  Sabedoria: 10
  Carisma: 16"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Descreva os atributos do NPC (um por linha)
                  </p>
                </div>

                <div>
                  <label htmlFor="spells" className="block text-sm font-medium text-foreground mb-2">
                    Magias
                  </label>
                  <textarea
                    id="spells"
                    value={formData.spells}
                    onChange={(e) => setFormData({ ...formData, spells: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                    placeholder="Bola de Fogo
  Cura
  Proteção Divina
  Raio de Gelo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Liste as magias do NPC (uma por linha)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] text-primary-foreground rounded-md transition-all"
                  >
                    {editingNpc ? "Atualizar" : "Criar"}
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