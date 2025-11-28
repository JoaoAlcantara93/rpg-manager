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
import { Plus, Trash2, Search, ArrowLeft, X, Edit, BookOpen, Clock, MapPin, Eye, EyeOff, Users, User, Book, Scroll, Swords ,MoreHorizontal, Dices} from "lucide-react";
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
    toast.success(`🎲 ${dice}: ${result}`);
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
    <Layout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
             
              <div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Bem-vindo, Mestre!
                </h2>
                <p className="text-muted-foreground">Registro completo das suas aventuras</p>
              </div>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedNote ? "Editar Anotação" : "Nova Anotação"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedNote ? "Atualize os dados da anotação" : "Crie uma nova anotação"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => selectedNote ? handleUpdateNote(selectedNote) : handleSubmit(e)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note_type">Tipo de Anotação</Label>
                      <select
                        id="note_type"
                        value={formData.note_type}
                        onChange={(e) => setFormData({ ...formData, note_type: e.target.value as any })}
                        className="w-full p-2 border border-border rounded-md bg-background"
                        required
                      >
                        <option value="adventure">Aventura</option>
                        <option value="session">Sessão</option>
                        <option value="idea">Ideia</option>
                        <option value="draft">Rascunho</option>
                      </select>
                    </div>
                  </div>

                  {formData.note_type === 'session' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session_number">Número da Sessão</Label>
                        <Input
                          id="session_number"
                          type="number"
                          value={formData.session_number}
                          onChange={(e) => setFormData({ ...formData, session_number: e.target.value })}
                          placeholder="Ex: 1, 2, 3..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session_title">Título da Sessão (opcional)</Label>
                        <Input
                          id="session_title"
                          value={formData.session_title}
                          onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
                          placeholder="Ex: O Segredo das Ruínas"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Conteúdo</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full p-2 border border-border rounded-md bg-background min-h-[200px] resize-y"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Digite uma tag e pressione Enter"
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-black/10 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_archived"
                      checked={formData.is_archived}
                      onChange={(e) => setFormData({ ...formData, is_archived: e.target.checked })}
                      className="rounded border-border"
                    />
                    <Label htmlFor="is_archived">Arquivada</Label>
                  </div>

                  <Button type="submit" className="w-full">
                    {selectedNote ? "Atualizar Anotação" : "Criar Anotação"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

     
         

          {selectedCampaignId ? (
            <>
              {/* Barra de Pesquisa e Filtros */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar no histórico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant={showArchived ? "default" : "outline"}
                  onClick={() => setShowArchived(!showArchived)}
                  className="border-2 border-border"
                >
                  {showArchived ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showArchived ? "Ocultar Arquivadas" : "Mostrar Arquivadas"}
                </Button>
              </div>

              {/* Tabs e Lista de Anotações */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="adventure">Aventura</TabsTrigger>
                  <TabsTrigger value="session">Sessão</TabsTrigger>
                  <TabsTrigger value="idea">Ideias</TabsTrigger>
                  <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                </TabsList>

                {/* Filtros de Tags */}
                {allTags.length > 0 && (
                  <Card className="border-2 border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground mr-2">Filtrar por tags:</span>
                        {allTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
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
                            className="h-6 text-xs"
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
                      className={`border-2 border-border bg-gradient-to-br from-card to-card/80 hover:border-primary/50 transition-all ${
                        note.is_archived ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-6">
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className={`p-2 rounded-lg ${getNoteTypeColor(note.note_type)} flex-shrink-0`}>
        {getNoteIcon(note.note_type)}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-lg flex items-center gap-2 truncate">
          {note.title}
          {note.is_archived && (
            <Badge variant="outline" className="bg-gray-500/20 text-gray-600 border-gray-500 flex-shrink-0">
              Arquivada
            </Badge>
          )}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className={getNoteTypeColor(note.note_type)}>
            {getNoteTypeLabel(note.note_type)}
          </Badge>
          {getSessionInfo(note) && (
            <span className="truncate">{getSessionInfo(note)}</span>
          )}
          <span className="flex-shrink-0">
            {new Date(note.updated_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </div>

    {/* Menu Dropdown */}
    <div className="flex-shrink-0 ml-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleEdit(note)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleArchive(note)}>
            {note.is_archived ? (
              <Eye className="w-4 h-4 mr-2" />
            ) : (
              <EyeOff className="w-4 h-4 mr-2" />
            )}
            {note.is_archived ? "Desarquivar" : "Arquivar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleDelete(note.id)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div className="prose prose-sm max-w-none mb-4">
    <p className="text-muted-foreground line-clamp-3">
      {note.notes}
    </p>
  </div>

  {note.tags.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {note.tags.map(tag => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  )}
</CardContent>
                    </Card>
                  ))}

                  {filteredNotes.length === 0 && (
                    <Card className="border-2 border-dashed border-border">
                      <CardContent className="py-12 text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhuma anotação encontrada</p>
                        <Button 
                          onClick={() => setDialogOpen(true)}
                          variant="outline"
                          className="mt-4"
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
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Selecione uma campanha para ver o histórico</p>
              </CardContent>
            </Card>
          )}

          {/* Card de Rolagem Rápida - AGORA FUNCIONANDO */}
          <Card className="card-pergaminho mt-6">
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

        {/* Sidebar - Visão Rápida */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estatísticas Rápidas */}
          {selectedCampaignId && (
            <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {notes.filter(n => n.note_type === 'adventure').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Aventuras</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {notes.filter(n => n.note_type === 'session').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Sessões</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {notes.filter(n => n.note_type === 'idea').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ideias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {allTags.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Tags Únicas</div>
                  </div>
                </div>
                
                {/* BOTÃO FORA DO GRID - Aqui é o lugar correto */}
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-to-r from-secondary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground"
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
          

          {/* Card Dashboard */}
          <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle>Acesso Rápido</CardTitle>
              </CardHeader>
            {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                    key={item.path}
                    className="card-pergaminho cursor-pointer transition-all duration-300 hover:scale-105 border hover:border-primary/30"
                    onClick={() => navigate(item.path)}
                  >
                    <CardHeader className="p-2 sm:p-3 relative z-10">
                      <div className="flex items-center gap-2">
                        {/* Ícone bem pequeno */}
                        <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg border border-white/10 flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* Textos bem compactos */}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-bold leading-tight">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground/90 text-xs leading-tight line-clamp-1">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                  );
                })}
          </Card>

          {/* Última Sessão */}
          {lastSession && (
            <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Última Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="font-semibold">
                      Sessão {lastSession.session_number}
                      {lastSession.session_title && ` - ${lastSession.session_title}`}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {lastSession.title}
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