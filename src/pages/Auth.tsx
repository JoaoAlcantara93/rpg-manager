import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, Waves } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // Efeito de partículas/água (inspirado no martim-pescador)
  useEffect(() => {
    const createWaterEffect = () => {
      const container = document.querySelector('.water-container');
      if (!container) return;
      
      // Remove efeitos antigos
      const oldEffects = container.querySelectorAll('.water-effect');
      oldEffects.forEach(e => e.remove());
      
      // Cria novas ondas
      for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = 'water-effect absolute rounded-full';
        wave.style.background = `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`;
        wave.style.width = `${100 + i * 50}px`;
        wave.style.height = `${100 + i * 50}px`;
        wave.style.opacity = '0.1';
        wave.style.animation = `water-ripple ${3 + i}s infinite`;
        wave.style.animationDelay = `${i}s`;
        wave.style.top = `${Math.random() * 100}%`;
        wave.style.left = `${Math.random() * 100}%`;
        container.appendChild(wave);
      }
    };
    
    createWaterEffect();
    const interval = setInterval(createWaterEffect, 4000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeito de fundo com gradiente do martim-pescador */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
      
      {/* Efeitos de água/reflexo */}
      <div className="water-container absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      

      <Card className="w-full max-w-md relative z-10 
                      bg-card/90 backdrop-blur-sm
                      border-2 border-primary/30
                      shadow-[var(--shadow-card)]
                      hover:shadow-[var(--shadow-glow)]
                      transition-all duration-500
                      hover:border-primary/50">
        
        <CardHeader className="space-y-4 text-center">
          {/* Logo com efeito de água */}
          <div className="relative mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-50" />
            <div className="relative w-24 h-24 rounded-full border-2 border-primary/30 
                          flex items-center justify-center overflow-hidden
                          bg-gradient-to-br from-card to-background
                          shadow-inner">
              <img 
                src="/images/logo.png" 
                alt="Maestrum Logo" 
                className="w-full h-full object-cover p-1"
              />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent 
                             bg-clip-text text-transparent">
                Maestrum
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {isLogin 
                ? "Controle total da sua aventura" 
                : "Comece sua aventura épica"}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top duration-300">
                <Label htmlFor="username" className="text-foreground/90">
                  Nome do Mestre
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className="bg-input/50 border-border/50
                           focus:border-primary focus:ring-1 focus:ring-primary/30
                           placeholder:text-muted-foreground/50
                           transition-all duration-200"
                  placeholder="Como deseja ser chamado?"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50 border-border/50
                         focus:border-primary focus:ring-1 focus:ring-primary/30
                         placeholder:text-muted-foreground/50
                         transition-all duration-200"
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input/50 border-border/50
                         focus:border-primary focus:ring-1 focus:ring-primary/30
                         placeholder:text-muted-foreground/50
                         transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full py-6
                       bg-gradient-to-r from-primary via-secondary to-accent
                       hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90
                       text-white font-semibold text-base
                       border-2 border-primary/30
                       shadow-lg hover:shadow-xl hover:shadow-primary/20
                       transition-all duration-300
                       group relative overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparando a sessão...
                </>
              ) : isLogin ? (
                <>
                  
                  Entrar 
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                 -translate-x-full group-hover:translate-x-full 
                                 transition-transform duration-1000" />
                </>
              ) : (
                <>
                  
                  Criar Sessão
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-muted-foreground
                       hover:text-foreground hover:bg-primary/10
                       group transition-all duration-300"
            >
              <span className="group-hover:scale-110 transition-transform duration-200">
                
              </span>
              <span className="ml-2">
                {isLogin 
                  ? "Primeira vez aqui? Cadastre-se" 
                  : "Já é um Mestre? Entre na sua mesa"}
              </span>
            </Button>
          </div>
          
          {/* Dica visual */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground/70">
              <span className="text-primary">🐦 Dica:</span> O martim-pescador vê através das águas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Adiciona os estilos de animação inline */}
      <style>{`
        @keyframes water-ripple {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { opacity: 0.1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .water-effect {
          animation-timing-function: ease-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;