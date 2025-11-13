import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Initiative = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    initiative_value: "",
    type: "ally",
  });
  const [draggedItem, setDraggedItem] = useState(null);

  // Dados mockados - substitua pela sua API real
  useEffect(() => {
    const mockData = [
      { id: "1", name: "Guerreiro", initiative_value: 15, type: "ally", position: 0 },
      { id: "2", name: "Orc", initiative_value: 12, type: "enemy", position: 1 },
      { id: "3", name: "Mago", initiative_value: 18, type: "ally", position: 2 },
      { id: "4", name: "Goblin", initiative_value: 8, type: "enemy", position: 3 },
    ];
    setEntries(mockData.sort((a, b) => b.initiative_value - a.initiative_value));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newEntry = {
      id: Date.now().toString(),
      name: formData.name,
      initiative_value: parseInt(formData.initiative_value),
      type: formData.type,
      position: entries.length,
    };

    const updatedEntries = [...entries, newEntry]
      .sort((a, b) => b.initiative_value - a.initiative_value)
      .map((entry, index) => ({ ...entry, position: index }));

    setEntries(updatedEntries);
    setDialogOpen(false);
    setFormData({ name: "", initiative_value: "", type: "ally" });
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  // Drag and Drop functions
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetIndex) return;

    const newEntries = [...entries];
    const [movedItem] = newEntries.splice(draggedItem, 1);
    newEntries.splice(targetIndex, 0, movedItem);

    const updatedEntries = newEntries.map((entry, index) => ({
      ...entry,
      position: index
    }));

    setEntries(updatedEntries);
    setDraggedItem(null);
  };

  const getTypeColor = (type) => {
    const colors = {
      ally: "from-green-500 to-green-600",
      enemy: "from-red-500 to-red-600", 
      neutral: "from-blue-500 to-blue-600",
    };
    return colors[type] || colors.neutral;
  };

  const getTypeBorder = (type) => {
    const borders = {
      ally: "border-l-green-400",
      enemy: "border-l-red-400",
      neutral: "border-l-blue-400",
    };
    return borders[type] || borders.neutral;
  };

  const getTypeText = (type) => {
    const texts = {
      ally: "Aliado",
      enemy: "Inimigo", 
      neutral: "Neutro",
    };
    return texts[type] || type;
  };

  // Função para voltar para o Dashboard (tela inicial do app)
  const handleBackToDashboard = () => {
    navigate("/Dashboard"); // ou "/dashboard" se essa for sua rota inicial
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header com botão de voltar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Lista de Iniciativa
          </h2>
          <p className="text-muted-foreground">Controle a ordem de combate</p>
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
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista Principal */}
        <div className="lg:col-span-2">
          <div className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-lg shadow-lg">
            <div className="p-6 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground">Ordem de Iniciativa</h3>
              <p className="text-muted-foreground">Arraste para reordenar</p>
            </div>
            <div className="p-6">
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <p className="text-muted-foreground">Nenhuma entrada na lista de iniciativa</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`border-2 border-border border-l-4 ${getTypeBorder(entry.type)} bg-gradient-to-r from-card to-card/80 rounded-lg p-4 hover:shadow-lg transition-all cursor-move`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(entry.type)} flex items-center justify-center font-bold text-xl text-white`}>
                            {entry.initiative_value}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{entry.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{getTypeText(entry.type)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div>
          <div className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-lg shadow-lg">
            <div className="p-6 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground">Informações</h3>
              <p className="text-muted-foreground">Dicas e estatísticas</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Como usar:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clique em "Adicionar" para novos personagens</li>
                    <li>• Arraste os cards para reordenar</li>
                    <li>• Clique no ícone de lixeira para remover</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Estatísticas:</h4>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Total de entradas:</span>
                      <span className="font-bold text-foreground">{entries.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aliados:</span>
                      <span className="font-bold text-green-600">{entries.filter(e => e.type === 'ally').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inimigos:</span>
                      <span className="font-bold text-red-600">{entries.filter(e => e.type === 'enemy').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">Nova Entrada</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Adicione um personagem à lista de iniciativa
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  placeholder="Nome do personagem"
                />
              </div>
              <div>
                <label htmlFor="initiative" className="block text-sm font-medium text-foreground mb-2">
                  Iniciativa
                </label>
                <input
                  id="initiative"
                  type="number"
                  value={formData.initiative_value}
                  onChange={(e) => setFormData({ ...formData, initiative_value: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Valor da iniciativa"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                  Tipo
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ally">Aliado</option>
                  <option value="enemy">Inimigo</option>
                  <option value="neutral">Neutro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDialogOpen(false);
                    setFormData({ name: "", initiative_value: "", type: "ally" });
                  }}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-md transition-all"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Initiative;