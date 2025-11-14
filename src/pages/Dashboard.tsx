import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dices, Users, Swords, ListOrdered, Save, Shield } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaignNotes, setCampaignNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ dice: string; result: number } | null>(null);

  useEffect(() => {
    const checkAuthAndLoadNotes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Carregar anotações salvas
      await loadCampaignNotes();
      setLoading(false);
    };
    
    checkAuthAndLoadNotes();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadCampaignNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaign_notes')
        .select('notes')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é "no rows returned"
        throw error;
      }

      if (data) {
        setCampaignNotes(data.notes);
      }
    } catch (error: any) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const saveCampaignNotes = async () => {
    try {
      setSavingNotes(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('campaign_notes')
        .upsert({
          user_id: user.id,
          notes: campaignNotes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success("Anotações salvas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar anotações");
      console.error('Erro ao salvar anotações:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const rollDice = (dice: string) => {
    let result = 0;
    
    if (dice === '1d20') {
      result = Math.floor(Math.random() * 20) + 1;
    } else if (dice === '2d6') {
      result = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    } else if (dice === '3d8') {
      result = Math.floor(Math.random() * 8) + 1 + Math.floor(Math.random() * 8) + 1 + Math.floor(Math.random() * 8) + 1;
    } else if (dice === '1d100') {
      result = Math.floor(Math.random() * 100) + 1;
    } else if (dice === '1d4') {
      result = Math.floor(Math.random() * 4) + 1;
    } else if (dice === '1d12') {
      result = Math.floor(Math.random() * 12) + 1;
    }
    
    setLastRoll({ dice, result });
    toast.success(`🎲 ${dice}: ${result}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Dices className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "NPCs",
      description: "Gerencie seus NPCs",
      icon: Users,
      path: "/npcs",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Players",
      description: "Gerencie seus jogadores",
      icon: Shield,
      path: "/players",
      gradient: "from-accent to-primary",
    },
    {
      title: "Rolagem de Dados",
      description: "Role dados de RPG",
      icon: Dices,
      path: "/dice",
      gradient: "from-primary to-primary/60",
    },
    {
      title: "Combate",
      description: "Gerencie iniciativa, HP, status e turnos da batalha",
      icon: Swords,
      path: "/initiative",
      gradient: "from-destructive to-primary",
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal com os cards */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Bem-vindo, Mestre!
            </h2>
            <p className="text-muted-foreground mb-8">
              Escolha uma opção para gerenciar sua campanha
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.path}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-card)] border-2 border-border hover:border-primary/50 bg-gradient-to-br from-card to-card/80"
                    onClick={() => navigate(item.path)}
                  >
                    <CardHeader className="space-y-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Coluna lateral com anotações */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Anotações da Campanha
                  </span>
                </CardTitle>
                <CardDescription>
                  Suas anotações pessoais para a campanha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={campaignNotes}
                  onChange={(e) => setCampaignNotes(e.target.value)}
                  placeholder="Digite suas anotações, ideias, plot points, ou qualquer informação importante da campanha..."
                  className="min-h-[300px] resize-none border-2 border-border focus:border-primary/50 transition-colors"
                />
                <Button
                  onClick={saveCampaignNotes}
                  disabled={savingNotes}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingNotes ? "Salvando..." : "Salvar Anotações"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Suas anotações são salvas automaticamente no nosso banco de dados
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Card de Rolagem Rápida */}
        <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dices className="w-5 h-5" />
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Rolagem Rápida
              </span>
            </CardTitle>
            <CardDescription>
              Role dados rapidamente durante a sessão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Botões de Dados */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {[
                  { dice: '1d20', label: '1d20' },
                  { dice: '2d6', label: '2d6' },
                  { dice: '3d8', label: '3d8' },
                  { dice: '1d100', label: '1d100' },
                  { dice: '1d4', label: '1d4' },
                  { dice: '1d12', label: '1d12' },
                ].map(({ dice, label }) => (
                  <Button
                    key={dice}
                    onClick={() => rollDice(dice)}
                    variant="outline"
                    className="bg-primary/10 hover:bg-primary/20 border-2 border-border hover:border-primary/50 transition-all duration-200 min-w-[60px]"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Resultado */}
              <div className="flex items-center gap-3 min-w-[140px] justify-center sm:justify-end">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Última rolagem</div>
                  {lastRoll ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{lastRoll.dice}</span>
                      <span className="text-xl font-bold text-primary">{lastRoll.result}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">--</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;