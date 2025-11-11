import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Swords } from "lucide-react";

interface Player {
  id: string;
  name: string;
  character_class: string;
  level: number;
  hp_current: number;
  hp_max: number;
  ac: number;
  attributes: any;
  notes: string;
}

const Players = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    character_class: "",
    level: 1,
    hp_current: 0,
    hp_max: 0,
    ac: 10,
    attributes: "",
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
    fetchPlayers();
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar players");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const playerData = {
        ...formData,
        attributes: formData.attributes ? JSON.parse(formData.attributes) : {},
        user_id: user.id,
      };

      if (editingPlayer) {
        const { error } = await supabase
          .from("players")
          .update(playerData)
          .eq("id", editingPlayer.id);
        if (error) throw error;
        toast.success("Player atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("players").insert(playerData);
        if (error) throw error;
        toast.success("Player criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
      fetchPlayers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar player");
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      character_class: player.character_class || "",
      level: player.level,
      hp_current: player.hp_current,
      hp_max: player.hp_max,
      ac: player.ac,
      attributes: JSON.stringify(player.attributes, null, 2),
      notes: player.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este player?")) return;

    try {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
      toast.success("Player excluído com sucesso!");
      fetchPlayers();
    } catch (error: any) {
      toast.error("Erro ao excluir player");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      character_class: "",
      level: 1,
      hp_current: 0,
      hp_max: 0,
      ac: 10,
      attributes: "",
      notes: "",
    });
    setEditingPlayer(null);
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Players
            </h2>
            <p className="text-muted-foreground">Gerencie os personagens dos jogadores</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-accent to-primary hover:shadow-[var(--shadow-glow)] text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Novo Player
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlayer ? "Editar Player" : "Novo Player"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do personagem
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
                    <Label htmlFor="class">Classe</Label>
                    <Input
                      id="class"
                      value={formData.character_class}
                      onChange={(e) => setFormData({ ...formData, character_class: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="level">Nível</Label>
                    <Input
                      id="level"
                      type="number"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hp_current">HP Atual</Label>
                    <Input
                      id="hp_current"
                      type="number"
                      value={formData.hp_current}
                      onChange={(e) => setFormData({ ...formData, hp_current: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hp_max">HP Máx</Label>
                    <Input
                      id="hp_max"
                      type="number"
                      value={formData.hp_max}
                      onChange={(e) => setFormData({ ...formData, hp_max: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ac">CA</Label>
                    <Input
                      id="ac"
                      type="number"
                      value={formData.ac}
                      onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="attributes">Atributos (JSON)</Label>
                  <Textarea
                    id="attributes"
                    value={formData.attributes}
                    onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                    placeholder='{"str": 10, "dex": 12, "con": 14}'
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80">
                  {editingPlayer ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {players.length === 0 ? (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="py-12 text-center">
              <Swords className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum player criado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <Card key={player.id} className="border-2 border-border bg-gradient-to-br from-card to-card/80 hover:border-accent/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{player.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(player)}
                        className="hover:bg-accent/20"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(player.id)}
                        className="hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {player.character_class} - Nível {player.level}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">HP:</span>
                      <span className="font-semibold text-accent">
                        {player.hp_current}/{player.hp_max}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CA:</span>
                      <span className="font-semibold text-secondary">{player.ac}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Players;
