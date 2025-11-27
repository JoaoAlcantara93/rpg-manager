// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Dice from "./pages/Dice";
import NPCs from "./pages/NPCs"; // Note: importando de "Npcs" (com N maiúsculo)
import Players from "./pages/Players";
import Initiative from "./pages/Initiative"; 
import HistoryRPG from "./pages/HistoryRPG"; 
import MapManager from "./pages/MapManager"; 
import RulesRpg from "./pages/RulesRPG"; 
import NotFound from "./pages/NotFound";
import CampaignSelect from "./pages/CampaignSelect"; // NOVO
import CampaignForm from "./pages/CampaignForm"; // NOVO
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota raiz */}
          <Route path="/" element={<LandingPage />}  />
          
          {/* Autenticação */}
         
          
          {/* Fluxo de Campanhas */}
          <Route path="/campaign-select" element={<CampaignSelect />} />
          <Route path="/campaigns/new" element={<CampaignForm />} />
          <Route path="/campaigns/edit/:id" element={<CampaignForm />} />
          
          {/* Funcionalidades principais */}
          <Route path="/dashboard" element={<HistoryRPG />} />
          <Route path="/dice" element={<Dice />} />
          <Route path="/npcs" element={<NPCs />} />
          <Route path="/players" element={<Players />} />
          <Route path="/initiative" element={<Initiative />} />
          <Route path="/history" element={<HistoryRPG />} />
          
          <Route path="/mapmanager" element={<MapManager/>} />
          <Route path="/rules" element={<RulesRpg />} />
          
          /* Landing Page*/
          <Route path="/login" element={<Auth />} />
          
          {/* Rota catch-all */}
          <Route path="*" element={<NotFound />} />
          <Route element={<Error />} path="*" />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;