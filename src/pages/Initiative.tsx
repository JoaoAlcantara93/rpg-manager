import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ListOrdered, ArrowUp, ArrowDown } from "lucide-react";

interface InitiativeEntry {
  id: string;
  name: string;
  initiative_value: number;
  type: string;
  position: number;
}

const Initiative = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<InitiativeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    initiative_value: 0,
    type: "ally",
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
    fetchEntries();
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("initiative_entries")
        .select("*")
        .order("initiative_value", { ascending: false })
        .order("position", { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar iniciativa");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("initiative_entries").insert({
        ...formData,
        position: entries.length,
        user_id: user.id,
      });

      if (error) throw error;
      toast.success("Entrada adicionada com sucesso!");
      setDialogOpen(false);
      resetForm();
      fetchEntries();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar entrada");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("initiative_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Entrada removida com sucesso!");
      fetchEntries();
    } catch (error: any) {
      toast.error("Erro ao remover entrada");
    }
  };

  const moveEntry = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === entries.length - 1)
    ) {
      return;
    }

    const newEntries = [...entries];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newEntries[index], newEntries[swapIndex]] = [newEntries[swapIndex], newEntries[index]];

    setEntries(newEntries);

    try {
      await Promise.all([
        supabase
          .from("initiative_entries")
          .update({ position: swapIndex })
          .eq("id", newEntries[swapIndex].id),
        supabase
          .from("initiative_entries")
          .update({ position: index })
          .eq("id", newEntries[index].id),
      ]);
    } catch (error) {
      toast.error("Erro ao reordenar");
      fetchEntries();
    }
  };

  const resetForm = () => {
    setFormData({ name: "", initiative_value: 0, type: "ally" });
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Lista de Iniciativa
            </h2>
            <p className="text-muted-foreground">Controle a ordem de combate</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-destructive to-primary hover:shadow-[var(--shadow-glow)] text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle>Nova Entrada</DialogTitle>
                <DialogDescription>
                  Adicione um personagem à lista de iniciativa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="initiative">Iniciativa</Label>
                  <Input
                    id="initiative"
                    type="number"
                    value={formData.initiative_value}
                    onChange={(e) => setFormData({ ...formData, initiative_value: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ally">Aliado</SelectItem>
                      <SelectItem value="enemy">Inimigo</SelectItem>
                      <SelectItem value="neutral">Neutro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80">
                  Adicionar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {entries.length === 0 ? (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="py-12 text-center">
              <ListOrdered className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma entrada na lista de iniciativa</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const typeColors = {
                ally: "border-l-accent",
                enemy: "border-l-destructive",
                neutral: "border-l-secondary",
              };

              return (
                <Card
                  key={entry.id}
                  className={`border-2 border-border border-l-4 ${typeColors[entry.type as keyof typeof typeColors]} bg-gradient-to-r from-card to-card/80 hover:shadow-lg transition-all`}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-xl text-primary-foreground">
                          {entry.initiative_value}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{entry.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">{entry.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveEntry(index, "up")}
                          disabled={index === 0}
                          className="hover:bg-accent/20"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveEntry(index, "down")}
                          disabled={index === entries.length - 1}
                          className="hover:bg-accent/20"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Initiative;
