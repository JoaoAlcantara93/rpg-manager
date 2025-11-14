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
import { toast } from "sonner";
import { Plus, Trash2, Heart, Shield, Search, ArrowLeft, X } from "lucide-react";

interface InitiativeCharacter {
  id: string;
  name: string;
  initiative_value: number;
  position: number;
  current_hp: number;
  max_hp: number;
  armor_class: number;
  notes: string;
  character_type: 'player' | 'npc';
  statuses: CharacterStatus[];
}

interface CharacterStatus {
  id: string;
  status_type: {
    name: string;
    color: string;
    description: string;
  };
  duration?: number;
  notes: string;
}

interface StatusType {
  id: string;
  name: string;
  color: string;
  description: string;
}

const Initiative = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<InitiativeCharacter[]>([]);
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<InitiativeCharacter | null>(null);
  const [searchStatus, setSearchStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [draggedCharacter, setDraggedCharacter] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    initiative_value: 0,
    current_hp: 0,
    max_hp: 0,
    armor_class: 10,
    notes: "",
    character_type: "player" as 'player' | 'npc',
  });
  
  const [statusFormData, setStatusFormData] = useState({
    status_type_id: "",
    duration: 0,
    notes: "",
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await Promise.all([fetchCharacters(), fetchStatusTypes()]);
  };

  const fetchCharacters = async () => {
    try {
      const { data: initiatives, error } = await supabase
        .from("initiative_entries")
        .select("*")
        .order("initiative_value", { ascending: false })
        .order("position", { ascending: false });

      if (error) throw error;

      const charactersWithStatuses = await Promise.all(
        (initiatives || []).map(async (char) => {
          const { data: statuses } = await supabase
            .from("initiative_character_status")
            .select(`
              id,
              duration,
              notes,
              status_type:character_status_types(name, color, description)
            `)
            .eq("initiative_id", char.id);

          return {
            ...char,
            statuses: statuses || [],
          };
        })
      );

      setCharacters(charactersWithStatuses);
    } catch (error: any) {
      console.error("Erro ao carregar lista de iniciativa:", error);
      toast.error("Erro ao carregar lista de iniciativa");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("character_status_types")
        .select("*")
        .order("name");

      if (error) throw error;
      setStatusTypes(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar tipos de status");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleDragStart = (e: React.DragEvent, characterId: string) => {
    setDraggedCharacter(characterId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetCharacterId: string) => {
    e.preventDefault();
    if (!draggedCharacter || draggedCharacter === targetCharacterId) return;

    const draggedIndex = characters.findIndex(c => c.id === draggedCharacter);
    const targetIndex = characters.findIndex(c => c.id === targetCharacterId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const updatedCharacters = [...characters];
    const [draggedItem] = updatedCharacters.splice(draggedIndex, 1);
    updatedCharacters.splice(targetIndex, 0, draggedItem);

    try {
      const updatePromises = updatedCharacters.map((character, index) =>
        supabase
          .from("initiative_entries")
          .update({ position: index + 1 })
          .eq("id", character.id)
      );

      await Promise.all(updatePromises);
      setCharacters(updatedCharacters);
      toast.success("Ordem atualizada!");
    } catch (error: any) {
      toast.error("Erro ao reordenar iniciativa");
    }

    setDraggedCharacter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const characterData = {
        ...formData,
        user_id: user.id,
        position: characters.length + 1,
      };

      const { error } = await supabase.from("initiative_entries").insert(characterData);
      if (error) throw error;

      toast.success("Personagem adicionado à iniciativa!");
      setDialogOpen(false);
      resetForm();
      fetchCharacters();
    } catch (error: any) {
      console.error("Erro ao adicionar personagem:", error);
      toast.error(error.message || "Erro ao adicionar personagem");
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter) return;

    try {
      const { error } = await supabase
        .from("initiative_character_status")
        .insert({
          initiative_id: selectedCharacter.id,
          status_type_id: statusFormData.status_type_id,
          duration: statusFormData.duration || null,
          notes: statusFormData.notes,
        });

      if (error) throw error;

      toast.success("Status adicionado!");
      setStatusDialogOpen(false);
      resetStatusForm();
      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao adicionar status");
    }
  };

  const handleRemoveStatus = async (statusId: string) => {
    try {
      const { error } = await supabase
        .from("initiative_character_status")
        .delete()
        .eq("id", statusId);

      if (error) throw error;

      toast.success("Status removido!");
      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao remover status");
    }
  };

  const handleUpdateHP = async (characterId: string, newHP: number) => {
    try {
      const { error } = await supabase
        .from("initiative_entries")
        .update({ current_hp: newHP })
        .eq("id", characterId);

      if (error) throw error;

      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao atualizar HP");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este personagem da iniciativa?")) return;

    try {
      const { error } = await supabase.from("initiative_entries").delete().eq("id", id);
      if (error) throw error;
      toast.success("Personagem removido!");
      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao remover personagem");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      initiative_value: 0,
      current_hp: 0,
      max_hp: 0,
      armor_class: 10,
      notes: "",
      character_type: "player",
    });
  };

  const resetStatusForm = () => {
    setStatusFormData({
      status_type_id: "",
      duration: 0,
      notes: "",
    });
    setSelectedCharacter(null);
  };

  const filteredStatusTypes = statusTypes.filter(status =>
    status.name.toLowerCase().includes(searchStatus.toLowerCase())
  );

  const handleConsultStatus = (status: StatusType) => {
    setSelectedStatus(status);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBackToDashboard}
                className="border-2 border-border hover:bg-accent/20"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Lista de Iniciativa
                </h2>
                <p className="text-muted-foreground">Arraste para reordenar a lista</p>
              </div>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-accent to-primary hover:shadow-[var(--shadow-glow)] text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border">
                <DialogHeader>
                  <DialogTitle>Adicionar à Iniciativa</DialogTitle>
                  <DialogDescription>
                    Adicione um personagem à lista de iniciativa
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="character_type">Tipo</Label>
                      <select
                        id="character_type"
                        value={formData.character_type}
                        onChange={(e) => setFormData({ ...formData, character_type: e.target.value as 'player' | 'npc' })}
                        className="w-full p-2 border-2 border-border rounded-md bg-background"
                      >
                        <option value="player">Jogador</option>
                        <option value="npc">NPC</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="initiative_value">Iniciativa</Label>
                      <Input
                        id="initiative_value"
                        type="number"
                        value={formData.initiative_value}
                        onChange={(e) => setFormData({ ...formData, initiative_value: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="current_hp">HP Atual</Label>
                      <Input
                        id="current_hp"
                        type="number"
                        value={formData.current_hp}
                        onChange={(e) => setFormData({ ...formData, current_hp: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_hp">HP Máximo</Label>
                      <Input
                        id="max_hp"
                        type="number"
                        value={formData.max_hp}
                        onChange={(e) => setFormData({ ...formData, max_hp: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="armor_class">CA</Label>
                    <Input
                      id="armor_class"
                      type="number"
                      value={formData.armor_class}
                      onChange={(e) => setFormData({ ...formData, armor_class: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80">
                    Adicionar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {characters.map((character, index) => (
              <div
                key={character.id}
                draggable
                onDragStart={(e) => handleDragStart(e, character.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, character.id)}
                className="cursor-move transition-all duration-200 hover:scale-[1.02]"
              >
                <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 hover:border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                          <span className="font-bold text-lg">{index + 1}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{character.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={character.character_type === 'player' 
                                ? "bg-green-500/20 text-green-600 border-green-500" 
                                : "bg-purple-500/20 text-purple-600 border-purple-500"
                              }
                            >
                              {character.character_type === 'player' ? 'Jogador' : 'NPC'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Iniciativa: {character.initiative_value}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={character.current_hp}
                              onChange={(e) => handleUpdateHP(character.id, parseInt(e.target.value))}
                              className="w-16 h-8 text-center"
                            />
                            <span>/</span>
                            <span className="w-16 text-center">{character.max_hp}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span>{character.armor_class}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog open={statusDialogOpen && selectedCharacter?.id === character.id} onOpenChange={(open) => {
                            setStatusDialogOpen(open);
                            if (!open) resetStatusForm();
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCharacter(character);
                                  setStatusDialogOpen(true);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-2 border-border">
                              <DialogHeader>
                                <DialogTitle>Adicionar Status</DialogTitle>
                                <DialogDescription>
                                  Adicione um status a {character.name}
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleAddStatus} className="space-y-4">
                                <div>
                                  <Label htmlFor="status_type">Status</Label>
                                  <select
                                    id="status_type"
                                    value={statusFormData.status_type_id}
                                    onChange={(e) => setStatusFormData({ ...statusFormData, status_type_id: e.target.value })}
                                    className="w-full p-2 border-2 border-border rounded-md bg-background"
                                    required
                                  >
                                    <option value="">Selecione um status</option>
                                    {statusTypes.map((status) => (
                                      <option key={status.id} value={status.id}>
                                        {status.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                               
                                <div>
                                  <Label htmlFor="status_notes">Notas do Status</Label>
                                  <Input
                                    id="status_notes"
                                    value={statusFormData.notes}
                                    onChange={(e) => setStatusFormData({ ...statusFormData, notes: e.target.value })}
                                  />
                                </div>
                                <Button type="submit" className="w-full">
                                  Adicionar Status
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(character.id)}
                          className="hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {character.statuses.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex flex-wrap gap-2">
                          {character.statuses.map((status) => (
                            <Badge
                              key={status.id}
                              className="flex items-center gap-1 cursor-pointer"
                              style={{ backgroundColor: status.status_type.color + '20', color: status.status_type.color, borderColor: status.status_type.color }}
                              onClick={() => {
                                const statusType = statusTypes.find(st => st.name === status.status_type.name);
                                if (statusType) setSelectedStatus(statusType);
                              }}
                            >
                              {status.status_type.name}
                              {status.duration && ` (${status.duration})`}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveStatus(status.id);
                                }}
                                className="ml-1 hover:bg-black/20 rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {characters.length === 0 && (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum personagem na iniciativa</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Consulta de Status</span>
                {selectedStatus && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedStatus(null)}
                    className="h-6 w-6"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Procure e consulte a descrição dos status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedStatus ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Procurar status..."
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredStatusTypes.map((status) => (
                      <div
                        key={status.id}
                        className="p-3 border border-border rounded-md hover:bg-accent/20 cursor-pointer transition-colors"
                        onClick={() => handleConsultStatus(status)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="font-medium">{status.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {status.description}
                        </p>
                      </div>
                    ))}
                    
                    {filteredStatusTypes.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum status encontrado
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedStatus.color }}
                    />
                    <h3 className="font-bold text-lg">{selectedStatus.name}</h3>
                  </div>
                  
                  <div className="bg-accent/10 p-3 rounded-md">
                    <p className="text-sm">{selectedStatus.description}</p>
                  </div>
                  
                  <Button
                    onClick={() => setSelectedStatus(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Voltar para a lista
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Initiative;