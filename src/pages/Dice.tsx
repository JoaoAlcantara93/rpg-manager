import { useState } from "react";

const diceTypes = [
  { sides: 4, name: "d4" },
  { sides: 6, name: "d6" },
  { sides: 8, name: "d8" },
  { sides: 10, name: "d10" },
  { sides: 12, name: "d12" },
  { sides: 20, name: "d20" },
  { sides: 100, name: "d100" },
];

const Dice = () => {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);

  const rollDice = (sides, name) => {
    setRolling(true);
    setResult(null);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * sides) + 1;
      setResult(roll);
      setHistory([{ dice: name, result: roll }, ...history.slice(0, 9)]);
      setRolling(false);
    }, 500);
  };

  const handleBackToDashboard = () => {
    // Navegação para a Dashboard - você pode usar window.location ou seu roteador preferido
    window.location.href = "/dashboard"; // ou use useNavigate se estiver usando React Router
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header com botão de voltar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Rolagem de Dados
          </h2>
          <p className="text-muted-foreground">Role seus dados de RPG</p>
        </div>
        <button
          onClick={handleBackToDashboard}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Voltar para Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="border-2 border-gray-200 bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Escolha um dado</h3>
              <p className="text-gray-600">Clique para rolar</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {diceTypes.map((dice) => (
                  <button
                    key={dice.sides}
                    onClick={() => rollDice(dice.sides, dice.name)}
                    disabled={rolling}
                    className="h-24 text-xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {dice.name}
                  </button>
                ))}
              </div>

              {result !== null && (
                <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-blue-300 shadow-inner">
                  <div className={`w-16 h-16 mx-auto mb-4 text-blue-500 ${rolling ? "animate-spin" : ""}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <p className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    {result}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="border-2 border-gray-200 bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Histórico</h3>
              <p className="text-gray-600">Últimas rolagens</p>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma rolagem ainda
                  </p>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-semibold text-blue-600">{item.dice}</span>
                      <span className="text-2xl font-bold text-purple-600">{item.result}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dice;