// src/components/Layout.tsx
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Dices } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
   /* try {
      console.log("🚪 Iniciando logout...");
      
      // Limpar localStorage PRIMEIRO
      localStorage.removeItem('current-campaign');
      localStorage.removeItem('rpg-campaigns');
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Erro no signOut:", error);
        // Mesmo com erro, continuamos com o logout local
      }
      
      console.log("✅ Logout realizado, redirecionando para /auth");
      
      // Usar window.location.href para FORÇAR o redirecionamento
      // Isso ignora o React Router e evita que outras lógicas interfiram
      window.location.href = '/auth';
      
    } catch (error: any) {
      console.error("❌ Erro no logout:", error);
      // Mesmo com erro, redireciona para auth
      window.location.href = '/auth';
    }*/
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[var(--shadow-glow)]">
              <Dices className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              RPG Manager
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;