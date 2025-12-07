// src/pages/Players.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dices, 
  Plus, 
  Pencil, 
  Trash2, 
  User, 
  Users, 
  Swords, 
  Zap,
  ChevronRight,
  Heart,
  Shield,
  Eye,
  Sword,
  Brain,
  Activity
} from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Player {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  character_class?: string | null;
  level?: number | null;
  attributes: any;
  hp_current?: number | null;
  hp_max?: number | null;
  ac?: number | null;
  fortitude_save?: number | null;
  will_save?: number | null;
  reflex_save?: number | null;
  perception?: number | null;
  notes?: string | null;
  observation?: string | null;
  created_at: string;
  updated_at: string;
}

const Players = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    character_class: "",
    level: "1",
    attributes: "{}",
    hp_current: "",
    hp_max: "",
    ac: "10",
    fortitude_save: "0",
    will_save: "0",
    reflex_save: "0",
    perception: "0",
    notes: "",
    observation: ""
  });

  const [showEmptyCard] = useState(true);

  useEffect(() => {
    const campaignId = localStorage.getItem('current-campaign');
    setCurrentCampaignId(campaignId);
    
    if (campaignId) {
      fetchPlayers(campaignId);
    } else {
      toast.error("Nenhuma campanha selecionada");
      setLoading(false);
    }
  }, []);

  const fetchPlayers = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPlayers(data || []);
    } catch (error) {
      console.error("Erro ao carregar Players:", error);
      toast.error("Erro ao carregar aventureiros");
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

      const playerData = {
        campaign_id: currentCampaignId,
        user_id: user.id,
        name: formData.name,
        character_class: formData.character_class || null,
        level: parseInt(formData.level) || 1,
        attributes: formData.attributes ? JSON.parse(formData.attributes) : {},
        hp_current: parseInt(formData.hp_current) || 0,
        hp_max: parseInt(formData.hp_max) || 0,
        ac: parseInt(formData.ac) || 10,
        fortitude_save: parseInt(formData.fortitude_save) || 0,
        will_save: parseInt(formData.will_save) || 0,
        reflex_save: parseInt(formData.reflex_save) || 0,
        perception: parseInt(formData.perception) || 0,
        notes: formData.notes || null,
        observation: formData.observation || null
      };

      let result;
      if (editingPlayer) {
        const { data, error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        setPlayers(players.map(p => p.id === editingPlayer.id ? data : p));
        toast.success("Aventureiro atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('players')
          .insert([playerData])
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        setPlayers([result, ...players]);
        toast.success("Aventureiro criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar Player:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      character_class: player.character_class || "",
      level: (player.level || 1).toString(),
      attributes: typeof player.attributes === 'string' 
        ? player.attributes 
        : JSON.stringify(player.attributes || {}, null, 2),
      hp_current: (player.hp_current || 0).toString(),
      hp_max: (player.hp_max || 0).toString(),
      ac: (player.ac || 10).toString(),
      fortitude_save: (player.fortitude_save || 0).toString(),
      will_save: (player.will_save || 0).toString(),
      reflex_save: (player.reflex_save || 0).toString(),
      perception: (player.perception || 0).toString(),
      notes: player.notes || "",
      observation: player.observation || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aventureiro?")) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlayers(players.filter(player => player.id !== id));
      toast.success("Aventureiro excluído com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  };

  const handleQuickHeal = async (playerId: string, amount: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const newHp = Math.min(
      (player.hp_current || 0) + amount,
      player.hp_max || 0
    );
    
    await updatePlayerHP(playerId, newHp);
    toast.success(`${player.name} curado em ${amount} HP`);
  };

  const handleQuickDamage = async (playerId: string, amount: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    
    const newHp = Math.max(0, (player.hp_current || 0) - amount);
    
    await updatePlayerHP(playerId, newHp);
    toast.warning(`${player.name} sofreu ${amount} de dano`);
    
    if (newHp < (player.hp_max || 1) * 0.25) {
      toast.error(`${player.name} está em estado crítico!`);
    }
  };

  const updatePlayerHP = async (playerId: string, newHp: number) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ hp_current: newHp })
        .eq('id', playerId);

      if (error) throw error;
      
      setPlayers(players.map(p => 
        p.id === playerId ? { ...p, hp_current: newHp } : p
      ));
    } catch (error) {
      toast.error("Erro ao atualizar HP");
    }
  };

  const exportToCombat = () => {
    const combatData = players.map(p => ({
      name: p.name,
      hp_current: p.hp_current,
      hp_max: p.hp_max,
      ac: p.ac,
      perception: p.perception,
      initiative: 0
    }));
    
    localStorage.setItem('combat-export', JSON.stringify(combatData));
    navigate('/initiative');
    toast.success('Aventureiros exportados para o combate!');
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      character_class: "",
      level: "1",
      attributes: "{}",
      hp_current: "",
      hp_max: "",
      ac: "10",
      fortitude_save: "0",
      will_save: "0",
      reflex_save: "0",
      perception: "0",
      notes: "",
      observation: ""
    });
    setEditingPlayer(null);
  };

  const getHealthPercentage = (player: Player) => {
    if (!player.hp_max) return 0;
    return ((player.hp_current || 0) / player.hp_max) * 100;
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
            <p className="text-muted-foreground">Carregando aventureiros...</p>
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
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Aventureiros
                </span>
              </h2>
              <p className="text-muted-foreground">Gerencie os aventureiros da campanha</p>
            </div>
          </div>
      
        </div>
        
        {/* Dashboard de Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-card to-card/80 border-2 border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{players.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card to-card/80 border-2 border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nível Médio</p>
                <p className="text-2xl font-bold">
                  {players.length > 0 
                    ? Math.round(players.reduce((acc, p) => acc + (p.level || 1), 0) / players.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card to-card/80 border-2 border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Swords className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">HP Total</p>
                <p className="text-2xl font-bold">
                  {players.reduce((acc, p) => acc + (p.hp_max || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card to-card/80 border-2 border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Activity className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feridos</p>
                <p className="text-2xl font-bold text-destructive">
                  {players.filter(p => getHealthPercentage(p) < 50).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* LISTA DE AVENTUREIROS */}
        {players.length === 0 ? (
          /* ESTADO VAZIO - Sem players */
          <div className="max-w-md mx-auto">
            <div 
              onClick={() => setDialogOpen(true)}
              className="border-3 border-dashed border-border hover:border-accent/50 bg-gradient-to-br from-card/30 to-card/10 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer group min-h-[400px] flex flex-col items-center justify-center p-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <User className="w-10 h-10 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                  Adicionar Primeiro Aventureiro
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Comece sua campanha adicionando os personagens jogadores. Você pode adicionar detalhes depois.
                </p>
                
                <div className="bg-card/50 border border-border rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Exemplo de informações úteis:</p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-primary/10 rounded">
                      <div className="font-bold">CA</div>
                      <div>16-18</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/10 rounded">
                      <div className="font-bold">HP</div>
                      <div>25-40</div>
                    </div>
                    <div className="text-center p-2 bg-accent/10 rounded">
                      <div className="font-bold">PER</div>
                      <div>+5-7</div>
                    </div>
                  </div>
                </div>
                
                <button className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center mx-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Aventureiro
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* COM PLAYERS - Grid com cards */
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
                    Novo Aventureiro
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Clique para adicionar um novo aventureiro à campanha
                  </p>
                  
                  <div className="mt-6 text-xs text-muted-foreground">
                    <p className="mb-1">Dica rápida:</p>
                    <ul className="space-y-1 text-left">
                      <li className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        <span>Comece apenas com nome e classe</span>
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
            
            {/* Players existentes */}
            {players.map((player) => {
              const healthPercentage = getHealthPercentage(player);
              const healthColor = getHealthColor(healthPercentage);
              
              return (
                <div 
                  key={player.id} 
                  className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-xl hover:border-accent/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden flex flex-col min-h-[400px]"
                >
                  {/* Cabeçalho do Card */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            healthPercentage > 75 ? 'bg-green-500' :
                            healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <h3 className="text-xl font-bold text-foreground truncate">{player.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {player.character_class && (
                            <span className="bg-primary/10 px-2 py-0.5 rounded">{player.character_class}</span>
                          )}
                          <span>•</span>
                          <span>Nvl {player.level || 1}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickHeal(player.id, 5);
                          }}
                          className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Curar 5 HP"
                        >
                          +5
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickDamage(player.id, 5);
                          }}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Causar 5 de dano"
                        >
                          -5
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(player);
                          }}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Barra de HP Visual */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-destructive" />
                          <span className="text-muted-foreground">Vitalidade</span>
                        </div>
                        <span className="font-medium">
                          {player.hp_current || 0}/{player.hp_max || 0}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({Math.round(((player.hp_current || 0) / (player.hp_max || 1)) * 100)}%)
                          </span>
                        </span>
                      </div>
                      
                      {/* Barra dupla - Vermelho atrás, Verde na frente */}
                      <div className="relative h-2 w-full bg-red-500/20 rounded-full overflow-hidden">
                        {/* Fundo vermelho (HP máximo) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-400/20"></div>
                        
                        {/* Verde (HP atual) */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 rounded-full"
                          style={{ 
                            width: `${Math.max(3, ((player.hp_current || 0) / (player.hp_max || 1)) * 100)}%` 
                          }}
                        >
                          {/* Efeito de brilho */}
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
                        <div className="text-lg font-bold bg-primary/10 py-1 rounded">{player.ac || 10}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="w-3 h-3 text-secondary" />
                          <div className="text-xs text-muted-foreground">PER</div>
                        </div>
                        <div className="text-lg font-bold bg-secondary/10 py-1 rounded">+{player.perception || 0}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Brain className="w-3 h-3 text-accent" />
                          <div className="text-xs text-muted-foreground">VON</div>
                        </div>
                        <div className="text-lg font-bold bg-accent/10 py-1 rounded">+{player.will_save || 0}</div>
                      </div>
                    </div>
                    
                    {/* Salvaguardas Secundárias */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Fortitude</div>
                        <div className="text-sm font-medium bg-green-500/10 text-green-500 py-1 rounded">
                          +{player.fortitude_save || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Reflexos</div>
                        <div className="text-sm font-medium bg-blue-500/10 text-blue-500 py-1 rounded">
                          +{player.reflex_save || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Anotações do Mestre */}
                    {player.observation && (
                      <details className="group mt-4">
                        <summary className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1 hover:text-foreground transition-colors">
                          <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                          Notas do Mestre
                        </summary>
                        <div className="mt-2 text-sm bg-muted/30 p-3 rounded border border-border">
                          {player.observation}
                        </div>
                      </details>
                    )}
                    
                    {/* Tags de Identificação */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {player.hp_max && player.hp_max > 50 && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">Tanque</span>
                      )}
                      {player.perception && player.perception > 5 && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">Percepção</span>
                      )}
                      {player.will_save && player.will_save > 5 && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full">Vontade Forte</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer com Ações */}
                  <div className="border-t border-border bg-card/50 px-4 py-3 mt-auto">
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir ${player.name}?`)) {
                          handleDelete(player.id);
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
                  {editingPlayer ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {editingPlayer ? "Editar Aventureiro" : "Novo Aventureiro"}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {editingPlayer ? "Atualize os dados do aventureiro" : "Preencha os dados do novo aventureiro"}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Seção: Identificação */}
              <div className="space-y-4">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Identificação
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
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
                      placeholder="Nome do aventureiro"
                    />
                  </div>
                  <div>
                    <label htmlFor="character_class" className="block text-sm font-medium text-foreground mb-2">
                      Classe
                    </label>
                    <input
                      id="character_class"
                      type="text"
                      value={formData.character_class}
                      onChange={(e) => setFormData({ ...formData, character_class: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      placeholder="Ex: Guerreiro, Mago, Clérigo"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-foreground mb-2">
                      Nível
                    </label>
                    <input
                      id="level"
                      type="number"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      min="1"
                    />
                  </div>
                  <div>
                    <label htmlFor="ac" className="block text-sm font-medium text-foreground mb-2">
                      Classe de Armadura (CA)
                    </label>
                    <input
                      id="ac"
                      type="number"
                      value={formData.ac}
                      onChange={(e) => setFormData({ ...formData, ac: e.target.value })}
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
                    <label htmlFor="hp_current" className="block text-sm font-medium text-foreground mb-2">
                      HP Atual
                    </label>
                    <input
                      id="hp_current"
                      type="number"
                      value={formData.hp_current}
                      onChange={(e) => setFormData({ ...formData, hp_current: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="hp_max" className="block text-sm font-medium text-foreground mb-2">
                      HP Máximo
                    </label>
                    <input
                      id="hp_max"
                      type="number"
                      value={formData.hp_max}
                      onChange={(e) => setFormData({ ...formData, hp_max: e.target.value })}
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
                <div className="grid grid-cols-4 gap-4">
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
              
              {/* Seção: Anotações */}
              <div className="space-y-4">
                <h4 className="font-semibold text-accent flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Anotações do Mestre
                </h4>
                <div>
                  <label htmlFor="observation" className="block text-sm font-medium text-foreground mb-2">
                    Observações, fraquezas, segredos...
                  </label>
                  <textarea
                    id="observation"
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-32 resize-none"
                    placeholder="Anotações importantes sobre o aventureiro..."
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
                  {editingPlayer ? "Atualizar Aventureiro" : "Criar Aventureiro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Players;