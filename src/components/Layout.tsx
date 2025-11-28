// src/components/Layout.tsx
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Dices, Settings, Users, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleChangeCampaign = () => {
    navigate('/campaign-select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center overflow-hidden bg-transparent">
              <img 
                src="/images/logo.png" 
                alt="Maestrum Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Maestrum
            </h1>
          </div>
          
          {/* Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:bg-accent/20">
                <User className="w-4 h-4 mr-2" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Configurações */}
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              
              {/* Trocar Campanha */}
              <DropdownMenuItem onClick={handleChangeCampaign}>
                <Users className="w-4 h-4 mr-2" />
                Trocar Campanha
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Sair */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;