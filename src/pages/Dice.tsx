import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices } from "lucide-react";
import Layout from "@/components/Layout";

const diceTypes = [
  { sides: 4, name: "d4" },
  { sides: 6, name: "d6" },
  { sides: 8, name: "d8" },
  { sides: 10, name: "d10" },
  { sides: 12, name: "d12" },
  { sides: 20, name: "d20" },
 
];

const Dice = () => {
  const navigate = useNavigate();
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
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header padronizado */}
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
                Rolagem de Dados
              </h2>
              <p className="text-muted-foreground">Role seus dados de RPG</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Área principal de rolagem */}
          <div className="lg:col-span-2">
            <div className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-lg shadow-lg">
              <div className="p-6 border-b border-border">
                <h3 className="text-2xl font-bold text-foreground">Escolha um dado</h3>
                <p className="text-muted-foreground">Clique para rolar</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {diceTypes.map((dice) => (
                    <button
                      key={dice.sides}
                      onClick={() => rollDice(dice.sides, dice.name)}
                      disabled={rolling}
                      className="h-24 text-xl font-bold bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] text-primary-foreground rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {dice.name}
                    </button>
                  ))}
                </div>

                {result !== null && (
                  <div className="text-center p-8 bg-accent/10 rounded-lg border-2 border-accent/30">
                    <div className={`w-16 h-16 mx-auto mb-4 text-primary ${rolling ? "animate-spin" : ""}`}>
                      <Dices className="w-16 h-16" />
                    </div>
                    <p className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {result}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div>
            <div className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-lg shadow-lg">
              <div className="p-6 border-b border-border">
                <h3 className="text-2xl font-bold text-foreground">Histórico</h3>
                <p className="text-muted-foreground">Últimas rolagens</p>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma rolagem ainda
                    </p>
                  ) : (
                    history.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-accent/10 rounded-lg border border-border"
                      >
                        <span className="font-semibold text-primary">{item.dice}</span>
                        <span className="text-2xl font-bold text-accent">{item.result}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dice;