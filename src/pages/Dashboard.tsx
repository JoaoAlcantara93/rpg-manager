import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dices, Users, Swords, ListOrdered } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      title: "Rolagem de Dados",
      description: "Role dados de RPG",
      icon: Dices,
      path: "/dice",
      gradient: "from-primary to-primary/60",
    },
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
      icon: Swords,
      path: "/players",
      gradient: "from-accent to-primary",
    },
    {
      title: "Lista de Iniciativa",
      description: "Controle a ordem de combate",
      icon: ListOrdered,
      path: "/initiative",
      gradient: "from-destructive to-primary",
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
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
    </Layout>
  );
};

export default Dashboard;
