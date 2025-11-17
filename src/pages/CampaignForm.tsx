// src/pages/CampaignForm.tsx - Versão Simplificada para Teste
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
import { supabase } from "@/integrations/supabase/client";

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

  // Testar autenticação e permissões
  const testAuthAndPermissions = async () => {
    console.log("🔐 Testando autenticação e permissões...");
    
    try {
      // 1. Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("👤 Usuário:", user);
      
      if (authError) {
        console.error("❌ Erro de auth:", authError);
        return;
      }

      if (!user) {
        console.warn("⚠️ Nenhum usuário autenticado");
        toast.error("Faça login para criar campanhas");
        return;
      }

      // 2. Testar INSERT
      console.log("🧪 Testando INSERT...");
      const testData = {
        name: "Campanha Teste",
        system: "D&D 5e",
        description: "Campanha de teste",
        user_id: user.id,
        status: 'active',
        settings: {}
      };

      const { data: insertData, error: insertError } = await supabase
        .from('campaigns')
        .insert([testData])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Erro no INSERT:", insertError);
        console.error("📋 Detalhes:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details
        });
        toast.error(`Erro RLS/Insert: ${insertError.message}`);
        return;
      }

      console.log("✅ INSERT funcionou:", insertData);

      // 3. Testar DELETE do registro de teste
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        console.error("❌ Erro no DELETE:", deleteError);
      } else {
        console.log("✅ DELETE funcionou");
      }

      toast.success("Permissões RLS estão OK!");

    } catch (error) {
      console.error("❌ Erro no teste:", error);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      loadCampaignData(id);
    }
  }, [isEditing, id]);

  const loadCampaignData = async (campaignId: string) => {
    setLoading(true);
    try {
      console.log("🔄 Carregando campanha:", campaignId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("❌ Erro ao carregar:", error);
        toast.error(`Erro: ${error.message}`);
        return;
      }

      if (data) {
        setFormData({
          name: data.name,
          system: data.system,
          description: data.description || ""
        });
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error("Erro ao carregar campanha");
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const campaignData = {
        name: formData.name.trim(),
        system: formData.system,
        description: formData.description.trim() || null,
        user_id: user.id,
        status: 'active',
        settings: {}
      };

      console.log("💾 Salvando:", campaignData);

      if (isEditing && id) {
        const { data, error } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        toast.success("Campanha atualizada!");
      } else {
        const { data, error } = await supabase
          .from('campaigns')
          .insert([campaignData])
          .select()
          .single();

        if (error) throw error;
        localStorage.setItem('current-campaign', data.id);
        toast.success("Campanha criada!");
      }

      navigate('/campaigns');
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSystemChange = (value: string) => {
    setFormData(prev => ({ ...prev, system: value }));
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
                {isEditing ? 'Atualize os detalhes' : 'Preencha os detalhes para começar'}
              </p>
            </div>
          </div>
        </div>

       
        {/* Form Card */}
        <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Detalhes da Campanha
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Atualize as informações' : 'Preencha as informações básicas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: A Jornada dos Heróis Perdidos"
                  required
                  disabled={saving}
                  className="border-2 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system">Sistema de RPG</Label>
                <Select value={formData.system} onValueChange={handleSystemChange} disabled={saving}>
                  <SelectTrigger className="border-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="D&D 5e">D&D 5e</SelectItem>
                    <SelectItem value="Pathfinder">Pathfinder</SelectItem>
                    <SelectItem value="Ordem Paranormal">Ordem Paranormal</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva sua campanha..."
                  rows={4}
                  disabled={saving}
                  className="border-2 border-border"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/campaigns')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving || !formData.name.trim()}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : (isEditing ? "Salvar" : "Criar")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CampaignForm;