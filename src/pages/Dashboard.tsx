// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dices, Users, Swords, ListOrdered, Save, Shield, BookOpen, Settings } from "lucide-react";
import { toast } from "sonner";

// Interface da Campanha
interface Campaign {
  id: string;
  name: string;
  system: string;
  description: string;
  created: string;
  lastPlayed: string;
  characterCount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaignNotes, setCampaignNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ dice: string; result: number } | null>(null);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const checkAuthAndLoadNotes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Verificar se tem campanha selecionada
      const currentCampaignId = localStorage.getItem('current-campaign');
      if (!currentCampaignId) {
        navigate('/campaign-select');
        return;
      }
      
      // Carregar campanha atual
      await loadCurrentCampaign();
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

  const loadCurrentCampaign = async () => {
    try {
      const currentCampaignId = localStorage.getItem('current-campaign');
      const savedCampaigns = localStorage.getItem('rpg-campaigns');
      
      if (currentCampaignId && savedCampaigns) {
        const campaigns: Campaign[] = JSON.parse(savedCampaigns);
        const campaign = campaigns.find(c => c.id === currentCampaignId);
        setCurrentCampaign(campaign || null);
        
        if (!campaign) {
          toast.error("Campanha não encontrada");
          navigate('/campaign-select');
        }
      } else {
        navigate('/campaign-select');
      }
    } catch (error) {
      console.error('Erro ao carregar campanha atual:', error);
      toast.error("Erro ao carregar campanha");
    }
  };

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
    } else if (dice === '1d6') {
      result = Math.floor(Math.random() * 6) + 1;
    } else if (dice === '1d8') {
      result = Math.floor(Math.random() * 8) + 1;
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

  const menuItems = [
    {
      title: "NPCs",
      description: "Gerencie seus NPCs",
      icon: Users,
      path: "/npcs",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Aventureiros",
      description: "Gerencie seus jogadores",
      icon: Shield,
      path: "/players",
      gradient: "from-accent to-primary",
    },
   
    {
      title: "Combate",
      description: "Gerencie os turnos da batalha",
      icon: Swords,
      path: "/initiative",
      gradient: "from-destructive to-primary",
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header com informações da campanha */}
        <div className="space-y-4">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Bem-vindo, Mestre!
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Escolha uma opção para gerenciar sua campanha
            </p>
          </div>
          
          {currentCampaign && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Ícone */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg flex-shrink-0">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  {/* Informações da campanha */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                      {currentCampaign.name}
                    </h3>
                    
                    {/* Informações em linha para desktop, coluna para mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-muted-foreground text-sm sm:text-base">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Sistema:</span> 
                        <span className="truncate">{currentCampaign.system}</span>
                      </span>
                      
                      <span className="hidden sm:inline">•</span>
                                          
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Última sessão:</span> 
                        <span>{new Date(currentCampaign.lastPlayed).toLocaleDateString('pt-BR')}</span>
                      </span>
                    </div>
                    
                  
                  </div>
                  
                  {/* Botão trocar campanha */}
                  <Button
                    variant="outline"
                    onClick={() => navigate('/campaign-select')}
                    className="border-2 border-border hover:border-primary/50 whitespace-nowrap w-full sm:w-auto mt-4 sm:mt-0"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Trocar Campanha
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Coluna principal com os cards de menu */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.path}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-card)] border-2 border-border hover:border-primary/50 bg-gradient-to-br from-card to-card/80"
                    onClick={() => navigate(item.path)}
                  >
                    <CardHeader className="space-y-3 p-4 sm:p-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl">{item.title}</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm sm:text-base">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Coluna lateral com anotações */}
          <div className="xl:col-span-1">
            <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Anotações
                  </span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Suas anotações pessoais para a campanha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <Textarea
                  value={campaignNotes}
                  onChange={(e) => setCampaignNotes(e.target.value)}
                  placeholder="Digite suas anotações, ideias, plot points, ou qualquer informação importante da campanha..."
                  className="min-h-[250px] sm:min-h-[300px] resize-none border-2 border-border focus:border-primary/50 transition-colors text-sm sm:text-base"
                />
                <Button
                  onClick={saveCampaignNotes}
                  disabled={savingNotes}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] text-sm sm:text-base"
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
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Dices className="w-5 h-5" />
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Rolagem Rápida
              </span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Role dados rapidamente durante a sessão
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-col gap-4">
              {/* Botões de Dados */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {[
                  { dice: '1d20', label: '1d20' },
                  { dice: '1d6', label: '1d6' },
                  { dice: '1d8', label: '1d8' },
                  { dice: '1d100', label: '1d100' },
                  { dice: '1d4', label: '1d4' },
                  { dice: '1d12', label: '1d12' },
                ].map(({ dice, label }) => (
                  <Button
                    key={dice}
                    onClick={() => rollDice(dice)}
                    variant="outline"
                    className="bg-primary/10 hover:bg-primary/20 border-2 border-border hover:border-primary/50 transition-all duration-200 min-w-[60px] text-sm py-2 h-auto"
                    size="sm"
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Resultado - agora em linha em telas maiores */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="text-center sm:text-left">
                  <div className="text-sm text-muted-foreground">Última rolagem</div>
                  {lastRoll ? (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
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