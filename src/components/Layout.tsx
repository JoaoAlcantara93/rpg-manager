// src/components/Layout.tsx
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Dices, Settings, Users, User, Home, Sword, BookOpen, Swords, Sun, Moon } from "lucide-react";
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
import { useTheme } from "@/hooks/use-theme";

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

  const { darkMode, toggleTheme } = useTheme();

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

  const handleChangeCampaign = () => navigate('/campaign-select'); // seleção de campanha
  const handleDashboard = () =>      navigate('/dashboard');       // tela de anotação/dashboard
  const handleInitiative = () =>     navigate('/initiative');      // tela de iniciativa  
  const handleNPCs = () =>           navigate('/npcs');            // tela de NPCs
  const handlePlayers = () =>        navigate('/players');         // tela de Jogadores
  const handleRules = () =>          navigate('/rules');           // regras

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
                        Anotações
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleInitiative}
                        className="gap-2"
                      >
                        <Swords className="w-4 h-4" />
                        Iniciativa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNPCs}
                        className="gap-2"
                      >
                        <Users className="w-4 h-4" />
                        NPCs
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayers}
                        className="gap-2"
                      >
                        <User className="w-4 h-4" />
                        Aventureiros
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
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-card border border-border hover:bg-accent/10 transition-colors"
                    aria-label={darkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
                  >
                    {darkMode ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-foreground/80" />
                    )}
                  </button>

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
                        Anotações
                      </DropdownMenuItem>
                      
                      {/* Iniciativa */}
                      <DropdownMenuItem 
                        onClick={handleInitiative}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <Sword className="w-4 h-4 mr-2 text-secondary" />
                        Iniciativa
                      </DropdownMenuItem>
                      
                      {/* NPCs */}
                      <DropdownMenuItem 
                        onClick={handleNPCs}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <Users className="w-4 h-4 mr-2 text-secondary" />
                        NPCs
                      </DropdownMenuItem>

                      {/* Aventureiros */}
                      <DropdownMenuItem 
                        onClick={handlePlayers}
                        className="cursor-pointer hover:bg-primary/5"
                      >
                        <User className="w-4 h-4 mr-2 text-secondary" />
                        Aventureiros
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
                <div className="md:hidden mt-3 overflow-x-auto">
                  <div className="flex items-center gap-1 px-1 pb-2 w-max">
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDashboard}
                      className={`gap-2 ${currentPage === "dashboard" ? "bg-primary/10 text-primary" : ""}`}
                    >
                      <Home className="w-4 h-4" />
                      Anotações
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleInitiative} className="gap-2">
                      <Sword className="w-4 h-4" />
                      Iniciativa
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleNPCs} className="gap-2">
                      <Users className="w-4 h-4" />
                      NPCs
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handlePlayers} className="gap-2">
                      <User className="w-4 h-4" />
                      Aventureiros
                    </Button>

                  </div>
                </div>
              )}

            </div>
          </header>
        )}
        
        {/* Conteúdo da página */}
        <main className={`container mx-auto px-4 py-6 ${showNavbar ? 'pt-8' : ''}`}>
          {children}
        </main>
        
      
      </div>
    </div>
  );
};

export default Layout;