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
import { Plus, Pencil, Trash2, Users } from "lucide-react";

interface NPC {
  id: string;
  name: string;
  attributes: any;
  spells: any;
}

const NPCs = () => {
  const navigate = useNavigate();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    attributes: "",
    spells: "",
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
    fetchNpcs();
  };

  const fetchNpcs = async () => {
    try {
      const { data, error } = await supabase
        .from("npcs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNpcs(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar NPCs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const npcData = {
        name: formData.name,
        attributes: formData.attributes ? JSON.parse(formData.attributes) : {},
        spells: formData.spells ? JSON.parse(formData.spells) : [],
        user_id: user.id,
      };

      if (editingNpc) {
        const { error } = await supabase
          .from("npcs")
          .update(npcData)
          .eq("id", editingNpc.id);
        if (error) throw error;
        toast.success("NPC atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("npcs").insert(npcData);
        if (error) throw error;
        toast.success("NPC criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
      fetchNpcs();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar NPC");
    }
  };

  const handleEdit = (npc: NPC) => {
    setEditingNpc(npc);
    setFormData({
      name: npc.name,
      attributes: JSON.stringify(npc.attributes, null, 2),
      spells: JSON.stringify(npc.spells, null, 2),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este NPC?")) return;

    try {
      const { error } = await supabase.from("npcs").delete().eq("id", id);
      if (error) throw error;
      toast.success("NPC excluído com sucesso!");
      fetchNpcs();
    } catch (error: any) {
      toast.error("Erro ao excluir NPC");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", attributes: "", spells: "" });
    setEditingNpc(null);
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
              NPCs
            </h2>
            <p className="text-muted-foreground">Gerencie seus personagens não-jogáveis</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-secondary to-accent hover:shadow-[var(--shadow-glow)] text-secondary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Novo NPC
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle>{editingNpc ? "Editar NPC" : "Novo NPC"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do NPC (attributes e spells devem ser JSON válido)
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
                  <Label htmlFor="attributes">Atributos (JSON)</Label>
                  <Textarea
                    id="attributes"
                    value={formData.attributes}
                    onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                    placeholder='{"str": 10, "dex": 12}'
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="spells">Magias (JSON)</Label>
                  <Textarea
                    id="spells"
                    value={formData.spells}
                    onChange={(e) => setFormData({ ...formData, spells: e.target.value })}
                    placeholder='["Bola de Fogo", "Escudo Arcano"]'
                    className="font-mono text-sm"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80">
                  {editingNpc ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {npcs.length === 0 ? (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum NPC criado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {npcs.map((npc) => (
              <Card key={npc.id} className="border-2 border-border bg-gradient-to-br from-card to-card/80 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{npc.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(npc)}
                        className="hover:bg-accent/20"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(npc.id)}
                        className="hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Atributos:</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(npc.attributes, null, 2)}
                      </pre>
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

export default NPCs;
