import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
            created_at: new Date().toISOString()
          },
          { 
            id: "2", 
            name: "Aragorn", 
            attributes: { str: 16, dex: 14, int: 12 },
            spells: ["Cura Básica"],
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
        // toast.success("NPC atualizado com sucesso!");
      } else {
        // Simulação de insert
        const newNpc = {
          id: Date.now().toString(),
          ...npcData,
          created_at: new Date().toISOString()
        };
        setNpcs([newNpc, ...npcs]);
        // toast.success("NPC criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar NPC:", error);
      // toast.error(error.message || "Erro ao salvar NPC");
    }
  };

  const handleEdit = (npc) => {
    setEditingNpc(npc);
    setFormData({
      name: npc.name,
      attributes: JSON.stringify(npc.attributes, null, 2),
      spells: JSON.stringify(npc.spells, null, 2),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este NPC?")) return;

    try {
      setNpcs(npcs.filter(npc => npc.id !== id));
      // toast.success("NPC excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir NPC:", error);
      // toast.error("Erro ao excluir NPC");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", attributes: "", spells: "" });
    setEditingNpc(null);
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
        <div className="text-center py-12">
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header com botão de voltar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              NPCs
            </h2>
            <p className="text-gray-400">Gerencie seus personagens não-jogáveis</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Voltar para Dashboard
            </button>
            <button
              onClick={() => setDialogOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo NPC
            </button>
          </div>
        </div>

        {/* Lista de NPCs */}
        {npcs.length === 0 ? (
          <div className="border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50">
            <div className="py-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-400">Nenhum NPC criado ainda</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {npcs.map((npc) => (
              <div 
                key={npc.id} 
                className="border-2 border-gray-600 bg-gradient-to-br from-gray-800 to-gray-800/80 rounded-lg hover:border-blue-500/50 transition-all shadow-lg cursor-default" // cursor-default para indicar que não é clicável
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white truncate flex-1">{npc.name}</h3>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Impede que o evento se propague
                          handleEdit(npc);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Impede que o evento se propague
                          handleDelete(npc.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-400 mb-2">Atributos:</p>
                      <pre className="text-xs bg-gray-700 p-2 rounded overflow-auto max-h-20">
                        {JSON.stringify(npc.attributes, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-2">Magias:</p>
                      <pre className="text-xs bg-gray-700 p-2 rounded overflow-auto max-h-20">
                        {JSON.stringify(npc.spells, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Adicionar/Editar NPC */}
        {dialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border-2 border-gray-700 max-w-md w-full">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">
                  {editingNpc ? "Editar NPC" : "Novo NPC"}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Preencha os dados do NPC (attributes e spells devem ser JSON válido)
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do NPC"
                  />
                </div>
                <div>
                  <label htmlFor="attributes" className="block text-sm font-medium text-gray-300 mb-2">
                    Atributos (JSON)
                  </label>
                  <textarea
                    id="attributes"
                    value={formData.attributes}
                    onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                    placeholder='{"str": 10, "dex": 12}'
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-24 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="spells" className="block text-sm font-medium text-gray-300 mb-2">
                    Magias (JSON)
                  </label>
                  <textarea
                    id="spells"
                    value={formData.spells}
                    onChange={(e) => setFormData({ ...formData, spells: e.target.value })}
                    placeholder='["Bola de Fogo", "Escudo Arcano"]'
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md transition-all"
                  >
                    {editingNpc ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NPCs;