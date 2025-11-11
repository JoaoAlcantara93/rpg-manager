import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";

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
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<Array<{ dice: string; result: number }>>([]);

  const rollDice = (sides: number, name: string) => {
    setRolling(true);
    setResult(null);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * sides) + 1;
      setResult(roll);
      setHistory([{ dice: name, result: roll }, ...history.slice(0, 9)]);
      setRolling(false);
    }, 500);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Rolagem de Dados
        </h2>
        <p className="text-muted-foreground mb-8">Role seus dados de RPG</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle>Escolha um dado</CardTitle>
                <CardDescription>Clique para rolar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {diceTypes.map((dice) => (
                    <Button
                      key={dice.sides}
                      onClick={() => rollDice(dice.sides, dice.name)}
                      disabled={rolling}
                      className="h-24 text-xl font-bold bg-gradient-to-br from-primary to-primary/60 hover:shadow-[var(--shadow-glow)] transition-all duration-300"
                    >
                      {dice.name}
                    </Button>
                  ))}
                </div>

                {result !== null && (
                  <div className="text-center p-8 bg-gradient-to-br from-muted to-muted/50 rounded-lg border-2 border-primary/30">
                    <Dices className={`w-16 h-16 mx-auto mb-4 text-secondary ${rolling ? "animate-spin" : ""}`} />
                    <p className="text-6xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                      {result}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
                <CardDescription>Últimas rolagens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma rolagem ainda
                    </p>
                  ) : (
                    history.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-muted rounded-lg border border-border"
                      >
                        <span className="font-semibold text-secondary">{item.dice}</span>
                        <span className="text-2xl font-bold text-accent">{item.result}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dice;
