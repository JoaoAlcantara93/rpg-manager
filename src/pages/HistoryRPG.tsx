import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, Search, ArrowLeft, X, Edit, BookOpen, Clock, MapPin, Eye, EyeOff, Users, User, Book, Scroll, Swords ,MoreHorizontal, Dices, BarChart3,
  ChevronRight,
  Calendar,
  Zap,
  
  // Outros ícones que podem estar no código:
  Users as UsersIcon,
  Settings,
  LogOut,
  } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CampaignNote {
  id: string;
  title: string;
  notes: string;
  note_type: 'adventure' | 'session' | 'idea' | 'draft';
  campaign_id: string;
  session_number?: number;
  session_title?: string;
  tags: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
}

interface LastRoll {
  dice: string;
  result: number;
}

const HistoryRPG = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<CampaignNote[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<CampaignNote | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [lastRoll, setLastRoll] = useState<LastRoll | null>(null); // MOVIDO PARA DENTRO DO COMPONENTE

  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    note_type: "adventure" as 'adventure' | 'session' | 'idea' | 'draft',
    session_number: "" as string | number,
    session_title: "",
    tags: [] as string[],
    is_archived: false,
  });

  const [tagInput, setTagInput] = useState("");

  // Função rollDice movida para dentro do componente
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
   
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      loadNotes();
    }
  }, [selectedCampaignId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Carregar campanhas do usuário
      console.log("📋 Buscando campanhas...");
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .order("name");

      if (campaignsError) {
        console.error("❌ Erro nas campanhas:", campaignsError);
        throw new Error(`Erro ao carregar campanhas: ${campaignsError.message}`);
      }

      console.log("✅ Campanhas encontradas:", campaignsData?.length || 0);
      setCampaigns(campaignsData || []);

      // Selecionar a primeira campanha automaticamente
      if (campaignsData && campaignsData.length > 0) {
        setSelectedCampaignId(campaignsData[0].id);
        setSelectedCampaign(campaignsData[0]);
      }

    } catch (error: any) {
      console.error("💥 Erro geral no loadData:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const loadNotes = async () => {
    if (!selectedCampaignId) return;
    
    try {
      console.log("📝 Buscando anotações para campanha:", selectedCampaignId);
      const { data: notesData, error: notesError } = await supabase
        .from("campaign_notes")
        .select("*")
        .eq("campaign_id", selectedCampaignId)
        .order("updated_at", { ascending: false });

      if (notesError) {
        console.error("❌ Erro nas anotações:", notesError);
        throw new Error(`Erro ao carregar anotações: ${notesError.message}`);
      }

      console.log("✅ Anotações encontradas:", notesData?.length || 0);
      setNotes(notesData || []);

    } catch (error: any) {
      console.error("💥 Erro ao carregar anotações:", error);
      toast.error(error.message);
    }
  };

  const handleCampaignChange = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    setSelectedCampaignId(campaignId);
    setSelectedCampaign(campaign || null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      toast.error("Selecione uma campanha primeiro");
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const noteData = {
        ...formData,
        user_id: user.id,
        campaign_id: selectedCampaignId,
        session_number: formData.session_number ? parseInt(formData.session_number as string) : null,
        session_title: formData.session_title || null,
      };

      const { error } = await supabase.from("campaign_notes").insert(noteData);
      if (error) throw error;

      toast.success("Anotação criada com sucesso!");
      setDialogOpen(false);
      resetForm();
      loadNotes();
    } catch (error: any) {
      console.error("Erro ao criar anotação:", error);
      toast.error(error.message || "Erro ao criar anotação");
    }
  };

  const handleUpdateNote = async (note: CampaignNote) => {
    try {
      const { error } = await supabase
        .from("campaign_notes")
        .update({
          title: formData.title,
          notes: formData.notes,
          note_type: formData.note_type,
          session_number: formData.session_number ? parseInt(formData.session_number as string) : null,
          session_title: formData.session_title || null,
          tags: formData.tags,
          is_archived: formData.is_archived,
        })
        .eq("id", note.id);

      if (error) throw error;

      toast.success("Anotação atualizada!");
      setDialogOpen(false);
      resetForm();
      loadNotes();
    } catch (error: any) {
      toast.error("Erro ao atualizar anotação");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;

    try {
      const { error } = await supabase.from("campaign_notes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Anotação excluída!");
      loadNotes();
    } catch (error: any) {
      toast.error("Erro ao excluir anotação");
    }
  };

  const handleArchive = async (note: CampaignNote) => {
    try {
      const { error } = await supabase
        .from("campaign_notes")
        .update({ is_archived: !note.is_archived })
        .eq("id", note.id);

      if (error) throw error;

      toast.success(note.is_archived ? "Anotação desarquivada!" : "Anotação arquivada!");
      loadNotes();
    } catch (error: any) {
      toast.error("Erro ao alterar status da anotação");
    }
  };

  const handleEdit = (note: CampaignNote) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      notes: note.notes,
      note_type: note.note_type,
      session_number: note.session_number || "",
      session_title: note.session_title || "",
      tags: note.tags,
      is_archived: note.is_archived,
    });
    setDialogOpen(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      notes: "",
      note_type: "adventure",
      session_number: "",
      session_title: "",
      tags: [],
      is_archived: false,
    });
    setSelectedNote(null);
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'adventure': return <BookOpen className="w-4 h-4" />;
      case 'session': return <Clock className="w-4 h-4" />;
      case 'idea': return <MapPin className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'adventure': return "bg-blue-500/20 text-blue-600 border-blue-500";
      case 'session': return "bg-green-500/20 text-green-600 border-green-500";
      case 'idea': return "bg-purple-500/20 text-purple-600 border-purple-500";
      case 'draft': return "bg-yellow-500/20 text-yellow-600 border-yellow-500";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500";
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'adventure': return "Aventura";
      case 'session': return "Sessão";
      case 'idea': return "Ideia";
      case 'draft': return "Rascunho";
      default: return type;
    }
  };

  const getSessionInfo = (note: CampaignNote) => {
    if (note.note_type === 'session' && note.session_number) {
      return `Sessão ${note.session_number}${note.session_title ? `: ${note.session_title}` : ''}`;
    }
    return null;
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || note.note_type === activeTab;
    const matchesTag = selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag));
    const matchesArchive = showArchived ? true : !note.is_archived;
    
    return matchesSearch && matchesTab && matchesTag && matchesArchive;
  });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Encontrar a última sessão baseada no maior session_number
  const lastSession = notes
    .filter(note => note.note_type === 'session' && note.session_number)
    .sort((a, b) => (b.session_number || 0) - (a.session_number || 0))[0];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando histórico...</p>
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
      icon: User,
      path: "/players",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Combate",
      description: "Gerencie os combates",
      icon: Swords,
      path: "/initiative",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Mapas",
      description: "Consule mapas",
      icon: MapPin,
      path: "*",
      gradient: "from-secondary to-accent",
    },   
    {
      title: "Regras",
      description: "Em desenvolvimento - Em breve!", 
      icon: Book,
      path: "#",
      gradient: "from-secondary to-accent", 
      disabled: true
    },
  ];

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro: {error}</p>
            <Button onClick={loadData} variant="outline" className="mr-2">
              Tentar Novamente
            </Button>
            <Button onClick={handleBackToDashboard} variant="outline">
              Voltar para Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="dashboard" backgroundIntensity="low">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 
                            border border-primary/20">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent 
                                 bg-clip-text text-transparent">
                    Bem vindo, mestre!
                  </span>
                </h2>
                <p className="text-muted-foreground">Organize todas as suas anotações de campanha</p>
              </div>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent 
                                 hover:from-primary/90 hover:to-accent/90
                                 border border-primary/30
                                 shadow-lg hover:shadow-xl hover:shadow-primary/20">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Anotação
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 
                                      shadow-[var(--shadow-glow)] max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {selectedNote ? "✏️ Editar Anotação" : "📝 Nova Anotação"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedNote ? "Atualize os dados da anotação" : "Registre informações importantes da campanha"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => selectedNote ? handleUpdateNote(selectedNote) : handleSubmit(e)} 
                      className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground/90">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="border-border/50 focus:border-primary"
                        placeholder="Ex: Encontro na Floresta Sombria"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note_type" className="text-foreground/90">Tipo</Label>
                      <select
                        id="note_type"
                        value={formData.note_type}
                        onChange={(e) => setFormData({ ...formData, note_type: e.target.value as any })}
                        className="w-full p-2 border border-border/50 rounded-md bg-card 
                                 focus:border-primary focus:outline-none"
                        required
                      >
                        <option value="adventure">📚 Aventura</option>
                        <option value="session">🎲 Sessão</option>
                        <option value="idea">💡 Ideia</option>
                        <option value="draft">📄 Rascunho</option>
                      </select>
                    </div>
                  </div>
  
                  {formData.note_type === 'session' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session_number" className="text-foreground/90">Número da Sessão</Label>
                        <Input
                          id="session_number"
                          type="number"
                          value={formData.session_number}
                          onChange={(e) => setFormData({ ...formData, session_number: e.target.value })}
                          className="border-border/50 focus:border-primary"
                          placeholder="Ex: 1, 2, 3..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session_title" className="text-foreground/90">Título da Sessão</Label>
                        <Input
                          id="session_title"
                          value={formData.session_title}
                          onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
                          className="border-border/50 focus:border-primary"
                          placeholder="Ex: O Segredo das Ruínas"
                        />
                      </div>
                    </div>
                  )}
  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-foreground/90">Conteúdo</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-3 border border-border/50 rounded-md bg-card 
                               focus:border-primary focus:outline-none min-h-[200px] resize-y
                               placeholder:text-muted-foreground/50"
                      placeholder="Descreva os eventos, NPCs, locais ou ideias..."
                      required
                    />
                  </div>
  
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-foreground/90">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="border-border/50 focus:border-primary"
                        placeholder="Ex: npc, tesouro, combate"
                      />
                      <Button 
                        type="button" 
                        onClick={addTag} 
                        variant="outline"
                        className="border-border hover:border-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border border-primary/20 
                                   hover:bg-primary/15 flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-primary/20 rounded-full p-0.5 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
  
                  <div className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="is_archived"
                      checked={formData.is_archived}
                      onChange={(e) => setFormData({ ...formData, is_archived: e.target.checked })}
                      className="rounded border-border focus:ring-primary"
                    />
                    <Label htmlFor="is_archived" className="text-foreground/90 cursor-pointer">
                      Arquivar esta anotação
                    </Label>
                  </div>
  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent 
                             hover:from-primary/90 hover:to-accent/90
                             border border-primary/30 shadow-lg"
                  >
                    {selectedNote ? "📝 Atualizar Anotação" : "✨ Criar Anotação"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
  
          {selectedCampaignId ? (
            <>
              {/* Barra de Pesquisa e Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar em suas anotações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-border/50 focus:border-primary"
                  />
                </div>
                <Button
                  variant={showArchived ? "default" : "outline"}
                  onClick={() => setShowArchived(!showArchived)}
                  className={`border-2 ${showArchived 
                    ? 'bg-primary/10 border-primary/30 text-primary' 
                    : 'border-border hover:border-primary/50'}`}
                >
                  {showArchived ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showArchived ? "Ocultar Arquivadas" : "Mostrar Arquivadas"}
                </Button>
              </div>
  
              {/* Tabs e Lista de Anotações */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-card/50 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    Todas
                  </TabsTrigger>
                  <TabsTrigger value="adventure" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    Aventuras
                  </TabsTrigger>
                  <TabsTrigger value="session" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    Sessões
                  </TabsTrigger>
                  <TabsTrigger value="idea" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    Ideias
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    Rascunhos
                  </TabsTrigger>
                </TabsList>
  
                {/* Filtros de Tags */}
                {allTags.length > 0 && (
                  <Card className="border-2 border-border/50 bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">🏷️ Filtrar tags:</span>
                        {allTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              selectedTags.includes(tag) 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-card hover:bg-primary/10'
                            }`}
                            onClick={() => {
                              setSelectedTags(prev =>
                                prev.includes(tag)
                                  ? prev.filter(t => t !== tag)
                                  : [...prev, tag]
                              );
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {selectedTags.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTags([])}
                            className="h-6 text-xs text-muted-foreground hover:text-primary"
                          >
                            Limpar filtros
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
  
                <TabsContent value={activeTab} className="space-y-4">
                  {filteredNotes.map((note) => (
                    <Card 
                      key={note.id} 
                      className={`border-2 ${note.is_archived 
                        ? 'border-gray-500/30 bg-gray-500/5' 
                        : 'border-border hover:border-primary/50'} 
                        bg-card/80 hover:bg-card transition-all duration-300
                        hover:shadow-[0_4px_20px_hsl(var(--primary)_/_0.1)]`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${getNoteTypeColor(note.note_type)} 
                                          flex-shrink-0 mt-1`}>
                              {getNoteIcon(note.note_type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-lg flex items-center gap-2 truncate">
                                {note.title}
                                {note.is_archived && (
                                  <Badge variant="outline" className="bg-gray-500/20 text-gray-600 
                                                                    border-gray-500/30 flex-shrink-0">
                                    📁 Arquivada
                                  </Badge>
                                )}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Badge variant="outline" className={`${getNoteTypeColor(note.note_type)} 
                                                                   border-current/20`}>
                                  {getNoteTypeLabel(note.note_type)}
                                </Badge>
                                {getSessionInfo(note) && (
                                  <span className="truncate">• {getSessionInfo(note)}</span>
                                )}
                                <span className="text-xs opacity-75">
                                  📅 {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
  
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-sm">
                              <DropdownMenuItem onClick={() => handleEdit(note)} className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2 text-primary" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(note)} className="cursor-pointer">
                                {note.is_archived ? (
                                  <Eye className="w-4 h-4 mr-2 text-primary" />
                                ) : (
                                  <EyeOff className="w-4 h-4 mr-2 text-primary" />
                                )}
                                <span>{note.is_archived ? "Desarquivar" : "Arquivar"}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(note.id)}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
  
                        <div className="prose prose-sm max-w-none mb-4">
                          <p className="text-foreground/80 line-clamp-3">
                            {note.notes}
                          </p>
                        </div>
  
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {note.tags.map(tag => (
                              <Badge 
                                key={tag} 
                                variant="secondary"
                                className="bg-primary/5 text-primary/90 border border-primary/10 
                                         hover:bg-primary/10 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
  
                  {filteredNotes.length === 0 && (
                    <Card className="border-2 border-dashed border-border/50 bg-card/50">
                      <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground mb-2">Nenhuma anotação encontrada</p>
                        <p className="text-sm text-muted-foreground/70 mb-4">
                          {searchTerm || selectedTags.length > 0 
                            ? "Tente outros termos ou limpe os filtros" 
                            : "Comece registrando suas ideias e sessões"}
                        </p>
                        <Button 
                          onClick={() => setDialogOpen(true)}
                          variant="outline"
                          className="border-primary/30 hover:border-primary/50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Primeira Anotação
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="border-2 border-dashed border-border/50 bg-card/50">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Selecione uma campanha para ver o histórico</p>
                <Button 
                  onClick={() => navigate('/campaign-select')}
                  variant="outline"
                  className="border-primary/30 hover:border-primary/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Selecionar Campanha
                </Button>
              </CardContent>
            </Card>
          )}
  
          {/* Card de Rolagem Rápida */}
          <Card className="mt-6 border-2 border-border bg-card/80">
            <CardHeader className="p-4 sm:p-6 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                  <Dices className="w-5 h-5 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Rolagem Rápida
                </span>
              </CardTitle>
              <CardDescription>
                Role dados rapidamente durante a sessão
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {[
                    { dice: '1d4', label: '1d4' },
                    { dice: '1d6', label: '1d6' },
                    { dice: '1d8', label: '1d8' },
                    { dice: '1d12', label: '1d12' },
                    { dice: '1d20', label: '1d20' },
                    { dice: '1d100', label: '1d100' },
                  ].map(({ dice, label }) => (
                    <Button
                      key={dice}
                      onClick={() => rollDice(dice)}
                      variant="outline"
                      className="bg-primary/5 hover:bg-primary/10 border-2 border-primary/20 
                               hover:border-primary/50 transition-all duration-200 
                               min-w-[70px] text-sm py-3 h-auto"
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
  
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                  <div className="text-center sm:text-left">
                    <div className="text-sm text-muted-foreground">Última rolagem</div>
                    {lastRoll ? (
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-xs text-muted-foreground">{lastRoll.dice}</span>
                        <span className="text-2xl font-bold text-primary">{lastRoll.result}</span>
                        {lastRoll.result === 20 && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full">
                            🎯 Crítico!
                          </span>
                        )}
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
  
        {/* Sidebar - Visão Rápida */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estatísticas Rápidas */}
          {selectedCampaignId && (
            <Card className="border-2 border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">
                      {notes.filter(n => n.note_type === 'adventure').length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">📚 Aventuras</div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <div className="text-2xl font-bold text-green-600">
                      {notes.filter(n => n.note_type === 'session').length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">🎲 Sessões</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <div className="text-2xl font-bold text-purple-600">
                      {notes.filter(n => n.note_type === 'idea').length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">💡 Ideias</div>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                    <div className="text-2xl font-bold text-yellow-600">
                      {allTags.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">🏷️ Tags</div>
                  </div>
                </div>
                
                {/* Botão Nova Anotação */}
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent 
                               hover:from-primary/90 hover:to-accent/90
                               border border-primary/30 shadow-lg hover:shadow-primary/20"
                      disabled={!selectedCampaignId}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Anotação
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
  
          {/* Acesso Rápido */}
          <Card className="border-2 border-border bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                <span>Acesso Rápido</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    className="p-3 rounded-lg border border-border hover:border-primary/50 
                             bg-card/50 hover:bg-card transition-all duration-300
                             hover:shadow-[0_4px_12px_hsl(var(--primary)_/_0.1)] cursor-pointer
                             group"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} 
                                    group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary 
                                             group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
  
          {/* Última Sessão */}
          {lastSession && (
            <Card className="border-2 border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  <span>Última Sessão</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <div className="font-semibold text-primary flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Sessão {lastSession.session_number}
                    </div>
                    {lastSession.session_title && (
                      <div className="text-sm font-medium mt-1">
                        {lastSession.session_title}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {lastSession.title}
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-2">
                      📅 {new Date(lastSession.updated_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  
  );
  
};

export default HistoryRPG;