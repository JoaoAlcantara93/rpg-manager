import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectAfterLogin = () => {
    const savedCampaigns = localStorage.getItem('rpg-campaigns');
    const campaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [];
    
    navigate("/campaign-select");
    toast.success("Login realizado com sucesso!");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        redirectAfterLogin();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username,
            },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email.");
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!loginError && loginData.user) {
          redirectAfterLogin();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-[var(--shadow-card)]">
        <CardHeader className="space-y-3 text-center">
          {/* Container do logo - imagem ocupando todo o círculo */}
          <div className="mx-auto w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden p-0 bg-transparent">
  <img 
    src="/images/logo.png" 
    alt="Maestrum Logo" 
    className="w-full h-full object-cover"
  />
</div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            Maestrum
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? "Controle total da sua campanha." : "Crie sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className="bg-input border-border"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>
            <Button
              type="submit"
              className="bg-primary/10 hover:bg-primary/20 border-2 border-border hover:border-primary/50 transition-all duration-200 whitespace-nowrap w-full mt-4"
              disabled={loading}
            >
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-secondary"
            >
              {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;