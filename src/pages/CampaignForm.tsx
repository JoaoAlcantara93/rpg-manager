// src/pages/CampaignForm.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Dice1, BookOpen } from "lucide-react";
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

const CampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: "",
    system: "D&D 5e",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadCampaignData(id);
    }
  }, [isEditing, id]);

  const loadCampaignData = (campaignId: string) => {
    setLoading(true);
    try {
      const savedCampaigns = localStorage.getItem('rpg-campaigns');
      if (savedCampaigns) {
        const campaigns: Campaign[] = JSON.parse(savedCampaigns);
        const campaignToEdit = campaigns.find(c => c.id === campaignId);
        if (campaignToEdit) {
          setFormData({
            name: campaignToEdit.name,
            system: campaignToEdit.system,
            description: campaignToEdit.description
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar campanha:', error);
      toast.error("Erro ao carregar dados da campanha");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Por favor, insira um nome para a campanha");
      return;
    }

    setSaving(true);

    try {
      // Simular uma requisição async
      await new Promise(resolve => setTimeout(resolve, 500));

      const savedCampaigns = localStorage.getItem('rpg-campaigns');
      const existingCampaigns: Campaign[] = savedCampaigns ? JSON.parse(savedCampaigns) : [];

      if (isEditing && id) {
        // Editar campanha existente
        const updatedCampaigns = existingCampaigns.map(campaign => 
          campaign.id === id 
            ? { 
                ...campaign, 
                name: formData.name.trim(),
                system: formData.system,
                description: formData.description.trim()
              }
            : campaign
        );
        localStorage.setItem('rpg-campaigns', JSON.stringify(updatedCampaigns));
        toast.success("Campanha atualizada com sucesso!");
      } else {
        // Criar nova campanha
        const newCampaign: Campaign = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          system: formData.system,
          description: formData.description.trim(),
          created: new Date().toISOString(),
          lastPlayed: new Date().toISOString(),
          characterCount: 0
        };

        const updatedCampaigns = [...existingCampaigns, newCampaign];
        localStorage.setItem('rpg-campaigns', JSON.stringify(updatedCampaigns));
        localStorage.setItem('current-campaign', newCampaign.id);
        toast.success("Campanha criada com sucesso!");
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      toast.error("Erro ao salvar campanha. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSystemChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      system: value
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Dice1 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando campanha...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/campaign-select')}
              className="border-2 border-border hover:border-primary/50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {isEditing ? 'Editar Campanha' : 'Criar Nova Campanha'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing 
                  ? 'Atualize os detalhes da sua campanha' 
                  : 'Preencha os detalhes para começar uma nova aventura'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Detalhes da Campanha
              </span>
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Atualize as informações da sua campanha' 
                : 'Preencha as informações básicas para começar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Campanha */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome da Campanha *
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: A Jornada dos Heróis Perdidos"
                  required
                  disabled={saving}
                  className="border-2 border-border focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Sistema de RPG */}
              <div className="space-y-2">
                <Label htmlFor="system" className="text-sm font-medium">
                  Sistema de RPG
                </Label>
                <Select value={formData.system} onValueChange={handleSystemChange} disabled={saving}>
                  <SelectTrigger className="border-2 border-border focus:border-primary/50 transition-colors">
                    <SelectValue placeholder="Selecione um sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D&D 5e">Dungeons & Dragons 5e</SelectItem>
                    <SelectItem value="Pathfinder">Pathfinder</SelectItem>
                    <SelectItem value="Call of Cthulhu">Call of Cthulhu</SelectItem>
                    <SelectItem value="Shadowrun">Shadowrun</SelectItem>
                    <SelectItem value="Cyberpunk Red">Cyberpunk Red</SelectItem>
                    <SelectItem value="Tormenta20">Tormenta20</SelectItem>
                    <SelectItem value="Outro">Outro Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrição da Campanha
                  <span className="text-muted-foreground text-sm font-normal ml-1">(Opcional)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o enredo principal, o mundo, temas importantes..."
                  rows={4}
                  disabled={saving}
                  className="border-2 border-border focus:border-primary/50 transition-colors resize-vertical min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 caracteres
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/campaign-select')}
                  disabled={saving}
                  className="border-2 border-border hover:border-primary/50 transition-colors"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving || !formData.name.trim()}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-[var(--shadow-glow)] transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Campanha")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card - Apenas para criação */}
        {!isEditing && (
          <Card className="border-2 border-border bg-gradient-to-br from-blue-500/10 to-blue-600/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Dice1 className="w-5 h-5" />
                Dicas para sua campanha
              </CardTitle>
              <CardDescription className="text-blue-600/80">
                Comece sua aventura com o pé direito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Escolha um nome que capture a essência da aventura</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Uma boa descrição ajuda os jogadores a se imergirem no mundo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Você pode editar essas informações a qualquer momento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Selecione o sistema que melhor se adapta ao estilo da sua campanha</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CampaignForm;