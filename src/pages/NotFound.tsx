import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-[var(--shadow-card)]">
        <CardHeader className="space-y-3 text-center">
          {/* Ícone de alerta */}
          <div className="mx-auto w-24 h-24 rounded-full border-2 border-primary/20 flex items-center justify-center bg-transparent">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            404
          </CardTitle>
          
          <CardDescription className="text-muted-foreground text-lg">
            Página não encontrada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Oops! A página que você está procurando não existe.
            </p>
            
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-secondary to-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar para o Início
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar para a página anterior
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;