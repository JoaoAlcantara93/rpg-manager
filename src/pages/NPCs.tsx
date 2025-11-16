import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dices, ArrowLeft, Plus, Pencil, Trash2, Users } from "lucide-react";
import Layout from "@/components/Layout"; // IMPORTE O LAYOUT

const NPCs = () => {
  const navigate = useNavigate();
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNpc, setEditingNpc] = useState(null);
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
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    // Simulação de verificação de auth - adapte para sua lógica real
    fetchNpcs();
  };

  const fetchNpcs = async () => {
    try {
      // Simulação de fetch - substitua pela sua lógica real
      setTimeout(() => {
        const mockData = [
          { 
            id: "1", 
            name: "Gandalf", 
            attributes: { str: 10, dex: 12, int: 18 },
            spells: ["Bola de Fogo", "Escudo Arcano", "Luz"],
            current_hp: 80,
            max_hp: 80,
            armor_class: 14,
            fortitude_save: 8,
            reflex_save: 6,
            will_save: 12,
            perception: 10,
            attacks: "Cajado +8 (1d6+2), Bola de Fogo 6d6",
            observation: "Mago poderoso do condado",
            created_at: new Date().toISOString()
          },
          { 
            id: "2", 
            name: "Aragorn", 
            attributes: { str: 16, dex: 14, int: 12 },
            spells: ["Cura Básica"],
            current_hp: 95,
            max_hp: 95,
            armor_class: 16,
            fortitude_save: 10,
            reflex_save: 8,
            will_save: 6,
            perception: 12,
            attacks: "Espada +10 (1d8+4), Arco +8 (1d6+2)",
            observation: "Herdeiro de Isildur",
            created_at: new Date().toISOString()
          },
        ];
        setNpcs(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar NPCs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let npcData;
      try {
        npcData = {
          name: formData.name,
          attributes: formData.attributes ? JSON.parse(formData.attributes) : {},
          spells: formData.spells ? JSON.parse(formData.spells) : [],
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
      } catch (jsonError) {
        alert("Erro no JSON: " + jsonError.message);
        return;
      }

      if (editingNpc) {
        // Simulação de update
        setNpcs(npcs.map(npc => 
          npc.id === editingNpc.id ? { ...npc, ...npcData } : npc
        ));
      } else {
        // Simulação de insert
        const newNpc = {
          id: Date.now().toString(),
          ...npcData,
          created_at: new Date().toISOString()
        };
        setNpcs([newNpc, ...npcs]);
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar NPC:", error);
    }
  };

  const handleEdit = (npc) => {
    setEditingNpc(npc);
    setFormData({
      name: npc.name,
      attributes: JSON.stringify(npc.attributes, null, 2),
      spells: JSON.stringify(npc.spells, null, 2),
      current_hp: npc.current_hp || "",
      max_hp: npc.max_hp || "",
      armor_class: npc.armor_class || "",
      fortitude_save: npc.fortitude_save || "",
      reflex_save: npc.reflex_save || "",
      will_save: npc.will_save || "",
      perception: npc.perception || "",
      attacks: npc.attacks || "",
      image_url: npc.image_url || "",
      observation: npc.observation || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este NPC?")) return;

    try {
      setNpcs(npcs.filter(npc => npc.id !== id));
    } catch (error) {
      console.error("Erro ao excluir NPC:", error);
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Dices className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout> {/* ENVOLVA TUDO COM O LAYOUT */}
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
          <button
            onClick={() => setDialogOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-accent to-primary hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center"
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
                        <span className="text-foreground">{npc.current_hp}/{npc.max_hp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">CA:</span>
                        <span className="text-foreground">{npc.armor_class}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Fort:</span>
                        <span className="text-foreground">{npc.fortitude_save}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Ref:</span>
                        <span className="text-foreground">{npc.reflex_save}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Von:</span>
                        <span className="text-foreground">{npc.will_save}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Per:</span>
                        <span className="text-foreground">{npc.perception}</span>
                      </div>
                    </div>

                    {/* Observações */}
                    {npc.observation && (
                      <div>
                        <p className="text-muted-foreground mb-1">Observações:</p>
                        <p className="text-foreground text-xs bg-accent/10 p-2 rounded">
                          {npc.observation}
                        </p>
                      </div>
                    )}

                    {/* Ataques */}
                    {npc.attacks && (
                      <div>
                        <p className="text-muted-foreground mb-1">Ataques:</p>
                        <p className="text-foreground text-xs bg-accent/10 p-2 rounded">
                          {npc.attacks}
                        </p>
                      </div>
                    )}

                    {/* Atributos */}
                    <div>
                      <p className="text-muted-foreground mb-1">Atributos:</p>
                      <pre className="text-xs bg-accent/10 p-2 rounded overflow-auto max-h-20 text-foreground">
                        {JSON.stringify(npc.attributes, null, 2)}
                      </pre>
                    </div>

                    {/* Magias */}
                    {npc.spells && npc.spells.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1">Magias:</p>
                        <pre className="text-xs bg-accent/10 p-2 rounded overflow-auto max-h-20 text-foreground">
                          {JSON.stringify(npc.spells, null, 2)}
                        </pre>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nome
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
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-foreground mb-2">
                      URL da Imagem
                    </label>
                    <input
                      id="image_url"
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                      Reflexo
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
                    Atributos (JSON)
                  </label>
                  <textarea
                    id="attributes"
                    value={formData.attributes}
                    onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                    placeholder='{"str": 10, "dex": 12, "con": 14, "int": 8, "wis": 10, "cha": 12}'
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm h-24 resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="spells" className="block text-sm font-medium text-foreground mb-2">
                    Magias (JSON)
                  </label>
                  <textarea
                    id="spells"
                    value={formData.spells}
                    onChange={(e) => setFormData({ ...formData, spells: e.target.value })}
                    placeholder='["Bola de Fogo", "Escudo Arcano", "Curar Ferimentos"]'
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm h-24 resize-none"
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
                    {editingNpc ? "Atualizar" : "Criar"}
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

export default NPCs;