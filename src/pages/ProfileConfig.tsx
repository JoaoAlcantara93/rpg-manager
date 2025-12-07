import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ProfileConfig = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (data?.username) {
        setUsername(data.username);
      }
    };

    loadProfile();
  }, []);

  // ✅ Atualizar username
  const handleUpdateUsername = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast.error("Erro ao atualizar nome");
    } else {
      toast.success("Username atualizado!");
    }
  };

  // ✅ Atualizar senha
  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao atualizar senha");
    } else {
      toast.success("Senha alterada com sucesso!");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <Layout showNavbar backgroundIntensity="low">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Username */}
        <Card>
          <CardHeader>
            <CardTitle>Nome de Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Seu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button onClick={handleUpdateUsername} disabled={loading}>
              Salvar Username
            </Button>
          </CardContent>
        </Card>

        {/* Senha */}
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handleUpdatePassword} disabled={loading}>
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
};

export default ProfileConfig;
