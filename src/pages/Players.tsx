// src/pages/Players.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dices, ArrowLeft, Plus, Pencil, Trash2, Users } from "lucide-react";
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
    level: "",
    attributes: "{}",
    hp_current: "",
    hp_max: "",
    ac: "",
    fortitude_save: "",
    will_save: "",
    reflex_save: "",
    perception: "",
    notes: "",
    observation: ""
  });

  useEffect(() => {
    const campaignId = localStorage.getItem('current-campaign');
    console.log("🎯 Campaign ID do localStorage:", campaignId);
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
      console.log("🔄 Buscando Players para campanha:", campaignId);
      
      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          campaign_id,
          user_id,
          name,
          character_class,
          level,
          attributes,
          hp_current,
          hp_max,
          ac,
          fortitude_save,
          will_save,
          reflex_save,
          perception,
          notes,
          observation,
          created_at,
          updated_at
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Erro ao carregar Players:", error);
        throw error;
      }

      console.log("✅ Players carregados:", data);
      setPlayers(data || []);
    } catch (error) {
      console.error("Erro ao carregar Players:", error);
      toast.error("Erro ao carregar Players");
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

      console.log("💾 Iniciando salvamento do Player...");

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

      console.log("📤 Dados a serem enviados para o Supabase:", playerData);

      if (editingPlayer) {
        const { data, error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id)
          .select(`
            id,
            campaign_id,
            user_id,
            name,
            character_class,
            level,
            attributes,
            hp_current,
            hp_max,
            ac,
            fortitude_save,
            will_save,
            reflex_save,
            perception,
            notes,
            observation,
            created_at,
            updated_at
          `)
          .single();

        if (error) {
          console.error("❌ Erro ao atualizar Player:", error);
          throw error;
        }

        console.log("✅ Player atualizado:", data);
      //  setPlayers(players.map(player => 
      //    player.id === editingPlayer.id ? data : player
      //  ));
        toast.success("Aventureiro atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('players')
          .insert([playerData])
          .select(`
            id,
            campaign_id,
            user_id,
            name,
            character_class,
            level,
            attributes,
            hp_current,
            hp_max,
            ac,
            fortitude_save,
            will_save,
            reflex_save,
            perception,
            notes,
            observation,
            created_at,
            updated_at
          `)
          .single();

        if (error) {
          console.error("❌ Erro ao criar Player:", error);
          throw error;
        }

        console.log("✅ Player criado:", data);
        //setPlayers([data, ...players]);
        toast.success("Aventureiro criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("❌ Erro ao salvar Player:", error);
      toast.error(`Erro ao salvar aventureiro: ${error.message}`);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      character_class: player.character_class || "",
      level: (player.level || 1).toString(),
      attributes: typeof player.attributes === 'string' ? player.attributes : JSON.stringify(player.attributes || {}, null, 2),
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
      console.log("🗑️ Excluindo Player:", id);
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("❌ Erro ao excluir Player:", error);
        throw error;
      }

      setPlayers(players.filter(player => player.id !== id));
      toast.success("Aventureiro excluído com sucesso!");
    } catch (error: any) {
      console.error("❌ Erro ao excluir Player:", error);
      toast.error(`Erro ao excluir aventureiro: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      character_class: "",
      level: "",
      attributes: "{}",
      hp_current: "",
      hp_max: "",
      ac: "",
      fortitude_save: "",
      will_save: "",
      reflex_save: "",
      perception: "",
      notes: "",
      observation: ""
    });
    setEditingPlayer(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
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
      <div className="max-w-6xl mx-auto">
        {/* Header com botão de voltar padronizado */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 border-2 border-border hover:bg-accent/20 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Aventureiros
              </h2>
              <p className="text-muted-foreground">Gerencie seus personagens jogáveis</p>
            </div>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-accent to-primary hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Aventureiro
          </button>
        </div>

        {/* Lista de Players */}
        {players.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg bg-card/50">
            <div className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum aventureiro criado ainda</p>
              <button
                onClick={() => setDialogOpen(true)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeiro Aventureiro
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <div 
                key={player.id} 
                className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-lg hover:border-accent/50 transition-all shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground truncate flex-1">{player.name}</h3>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(player);
                        }}
                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/20 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(player.id);
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Informações básicas */}
                  <div className="space-y-2 mb-4">
                    {player.character_class && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Classe:</span>
                        <span className="text-foreground font-medium">{player.character_class}</span>
                      </div>
                    )}
                    {player.level && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Nível:</span>
                        <span className="text-foreground font-medium">{player.level}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    {/* Status Básicos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">HP:</span>
                        <span className="text-foreground">{player.hp_current || 0}/{player.hp_max || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">CA:</span>
                        <span className="text-foreground">{player.ac || 10}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Per:</span>
                        <span className="text-foreground">{player.perception || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Fort:</span>
                        <span className="text-foreground">{player.fortitude_save || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Ref:</span>
                        <span className="text-foreground">{player.reflex_save || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Von:</span>
                        <span className="text-foreground">{player.will_save || 0}</span>
                      </div>                     
                    </div>

                    {/* Observações */}
                    {player.observation && (
                      <div>
                        <p className="text-muted-foreground mb-1">Observações:</p>
                        <p className="text-foreground text-xs bg-accent/10 p-2 rounded whitespace-pre-wrap">
                          {player.observation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Adicionar/Editar Player */}
        {dialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold text-foreground">
                  {editingPlayer ? "Editar Aventureiro" : "Novo Aventureiro"}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Preencha os dados do aventureiro
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                  </div>
                  <div>
                    <label htmlFor="ac" className="block text-sm font-medium text-foreground mb-2">
                      CA
                    </label>
                    <input
                      id="ac"
                      type="number"
                      value={formData.ac}
                      onChange={(e) => setFormData({ ...formData, ac: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

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
              
                <div>
                  <label htmlFor="observation" className="block text-sm font-medium text-foreground mb-2">
                    Observações
                  </label>
                  <textarea
                    id="observation"
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                    placeholder="Observações sobre o aventureiro..."
                  />
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
                    {editingPlayer ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Players;