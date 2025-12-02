// src/components/Layout.tsx
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Dices, Settings, Users, User, Home, Sword, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BackgroundEffects from "./BackgroundEffects";

interface LayoutProps {
  children: ReactNode;
  backgroundIntensity?: "low" | "medium" | "high";
  showNavbar?: boolean;
  currentPage?: string;
}

const Layout = ({ 
  children, 
  backgroundIntensity = "low",
  showNavbar = true,
  currentPage = "dashboard"
}: LayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair: " + error.message);
      return;
    }
    toast.success("Até a próxima aventura!");
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleChangeCampaign = () => {
    navigate('/campaign-select');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleInitiative = () => {
    navigate('/initiative');
  };

  const handleNotes = () => {
    navigate('/notes');
  };

  return (
    <div className="min-h-screen relative">
      {/* Efeitos de fundo padronizados */}
      <BackgroundEffects intensity={backgroundIntensity} />
      
      {/* Conteúdo principal com z-index mais alto */}
      <div className="relative z-10">
        {showNavbar && (
          <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo e Navegação Principal */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-50" />
                      <div className="relative w-10 h-10 rounded-full border-2 border-primary/30 
                                    flex items-center justify-center overflow-hidden
                                    bg-gradient-to-br from-card to-background">
                        <img 
                          src="/images/logo.png" 
                          alt="Maestrum Logo" 
                          className="w-full h-full object-cover p-0.5"
                        />
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold">
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent 
                                     bg-clip-text text-transparent">
                        Maestrum
                      </span>
                    </h1>
                  </div>

                  {/* Navegação Rápida (apenas no dashboard) */}
                  {currentPage === "dashboard" && (
                    <div className="hidden md:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDashboard}
                        className={`gap-2 ${currentPage === "dashboard" ? "bg-primary/10 text-primary" : ""}`}
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleInitiative}
                        className="gap-2"
                      >
                        <Sword className="w-4 h-4" />
                        Iniciativa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNotes}
                        className="gap-2"
                      >
                        <BookOpen className="w-4 h-4" />
                        Anotações
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Menu Dropdown do Usuário */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <span className="text-sm text-muted-foreground">
                      Mestre da campanha
                    </span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-primary/30 hover:border-primary/50 
                                 hover:bg-primary/5 gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 
                                      flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="hidden sm:inline">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-56 bg-card/95 backdrop-blur-sm border-border/50"
                    >
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Sessão Ativa
                      </div>
                      
                      {/* Dashboard */}
                      <DropdownMenuItem 
                        onClick={handleDashboard}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <Home className="w-4 h-4 mr-2 text-primary" />
                        Dashboard
                      </DropdownMenuItem>
                      
                      {/* Iniciativa */}
                      <DropdownMenuItem 
                        onClick={handleInitiative}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <Sword className="w-4 h-4 mr-2 text-secondary" />
                        Iniciativa
                      </DropdownMenuItem>
                      
                      {/* Anotações */}
                      <DropdownMenuItem 
                        onClick={handleNotes}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <BookOpen className="w-4 h-4 mr-2 text-accent" />
                        Anotações
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-border/50" />
                      
                      {/* Configurações */}
                      <DropdownMenuItem 
                        onClick={handleSettings}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                        Configurações
                      </DropdownMenuItem>
                      
                      {/* Trocar Campanha */}
                      <DropdownMenuItem 
                        onClick={handleChangeCampaign}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                        Trocar Campanha
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-border/50" />
                      
                      {/* Sair */}
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive hover:bg-destructive/5 focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da Aventura
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Navegação móvel */}
              {currentPage === "dashboard" && (
                <div className="flex md:hidden items-center justify-center gap-1 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDashboard}
                    className={`flex-1 gap-2 ${currentPage === "dashboard" ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleInitiative}
                    className="flex-1 gap-2"
                  >
                    <Sword className="w-4 h-4" />
                    Iniciativa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNotes}
                    className="flex-1 gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Anotações
                  </Button>
                </div>
              )}
            </div>
          </header>
        )}
        
        {/* Conteúdo da página */}
        <main className={`container mx-auto px-4 py-6 ${showNavbar ? 'pt-8' : ''}`}>
          {children}
        </main>
        
        {/* Footer sutil */}
        <footer className="border-t border-border/50 mt-12 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent 
                              flex items-center justify-center">
                  <span className="text-xs text-white">🐦</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Maestrum • Para mestres de RPG
                </span>
              </div>
              <div className="text-xs text-muted-foreground/70">
                Que sua sessão seja épica
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;