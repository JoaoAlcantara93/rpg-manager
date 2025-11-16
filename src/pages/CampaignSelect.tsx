// src/pages/CampaignSelect.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Dice1, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  system: string;
  description: string;
  created: string;
  lastPlayed: string;
  characterCount: number;
}

const CampaignSelect: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    try {
      const savedCampaigns = localStorage.getItem('rpg-campaigns');
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns));
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    localStorage.setItem('current-campaign', campaignId);
    toast.success("Campanha selecionada!");
    navigate('/dashboard');
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/new');
  };

  const handleEditCampaign = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    navigate(`/campaigns/edit/${campaignId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Dice1 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando campanhas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Suas Campanhas
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha uma campanha para gerenciar ou comece uma nova aventura
          </p>
        </div>

        {campaigns.length === 0 ? (
          // Estado vazio
          <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Dice1 className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Nenhuma campanha encontrada
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Comece criando sua primeira campanha de RPG e mergulhe em aventuras épicas
                </p>
                <Button
                  onClick={handleCreateCampaign}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] px-8 py-3 text-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Grid de campanhas
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Suas Campanhas ({campaigns.length})
                </h2>
                <p className="text-muted-foreground">
                  Clique em uma campanha para gerenciá-la
                </p>
              </div>
              <Button
                onClick={handleCreateCampaign}
                className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card de Criar Nova Campanha */}
              <Card
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-card)] border-2 border-dashed border-border hover:border-primary/50 bg-gradient-to-br from-card/50 to-card/30 min-h-[200px]"
                onClick={handleCreateCampaign}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">Nova Campanha</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Comece uma nova aventura
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Cards das Campanhas Existentes */}
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-card)] border-2 border-border hover:border-primary/50 bg-gradient-to-br from-card to-card/80 group"
                  onClick={() => handleSelectCampaign(campaign.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg mb-3">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditCampaign(e, campaign.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Editar
                      </Button>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{campaign.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {campaign.description || "Sem descrição"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sistema</span>
                      <span className="font-medium text-foreground">{campaign.system}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{campaign.characterCount} personagens</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(campaign.lastPlayed).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCampaign(campaign.id);
                        }}
                      >
                        Selecionar Campanha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        {campaigns.length > 0 && (
          <Card className="border-2 border-border bg-gradient-to-br from-blue-500/10 to-blue-600/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-blue-600 mb-2">💡 Dica</h3>
                <p className="text-blue-700 text-sm">
                  Suas campanhas são salvas localmente no seu navegador. 
                  Você pode criar quantas campanhas quiser e alternar entre elas a qualquer momento.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CampaignSelect;