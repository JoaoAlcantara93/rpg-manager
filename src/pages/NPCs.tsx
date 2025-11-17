// src/pages/NPCs.tsx - Versão Corrigida
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dices, ArrowLeft, Plus, Pencil, Trash2, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      
      // ESPECIFICAR TODOS OS CAMPOS que queremos retornar
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
      
      // Os dados já vêm com todos os campos, então podemos usar diretamente
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

      // SEMPRE obter o usuário autenticado
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
        attributes: formData.attributes,
        spells: formData.spells,
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
        // Atualizar NPC existente - ESPECIFICAR OS CAMPOS A RETORNAR
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
        // Criar novo NPC - ESPECIFICAR OS CAMPOS A RETORNAR
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
      attributes: typeof npc.attributes === 'string' ? npc.attributes : JSON.stringify(npc.attributes || {}, null, 2),
      spells: typeof npc.spells === 'string' ? npc.spells : JSON.stringify(npc.spells || [], null, 2),
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

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // Função para debug
  const debugDatabase = async () => {
    console.log("🐛 Debug do banco de dados:");
    console.log("📋 Campaign ID:", currentCampaignId);
    
    if (currentCampaignId) {
      const { data, error } = await supabase
        .from('npcs')
        .select('*')
        .eq('campaign_id', currentCampaignId);

      console.log("📊 NPCs no banco:", data);
      console.log("❌ Erro:", error);
    }
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
                NPCs
              </h2>
              <p className="text-muted-foreground">Gerencie seus personagens não-jogáveis</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={debugDatabase}
              className="px-4 py-2 border-2 border-border hover:bg-accent/20 rounded-lg transition-colors text-sm"
            >
              Debug
            </button>
            <button
              onClick={() => setDialogOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-accent to-primary hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo NPC
            </button>
          </div>
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-foreground truncate flex-1">{npc.name}</h3>
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
                  
                  <div className="space-y-3 text-sm">
                    {/* Status Básicos */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">HP:</span>
                        <span className="text-foreground">{npc.current_hp || 0}/{npc.max_hp || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">CA:</span>
                        <span className="text-foreground">{npc.armor_class || 10}</span>
                      </div>
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
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Per:</span>
                        <span className="text-foreground">{npc.perception || 0}</span>
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
                {/* ... (formulário permanece igual) */}
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NPCs;