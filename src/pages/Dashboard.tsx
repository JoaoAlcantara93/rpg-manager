// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Dices,
  Users,
  Swords,
  Scroll,
  Save,
  Heart,
  Shield,
  Skull,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Settings,
  Clock,
  MapPin,
  User,
  Book,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

// Interfaces
interface Campaign {
  id: string;
  name: string;
  system: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  user_id: string;
}

interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hpCurrent: number;
  hpMax: number;
  type: 'player' | 'npc' | 'monster';
  conditions: string[];
  ac?: number;
}

interface PlayerCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  conditions: string[];
  ac: number;
}

interface StatusType {
  id: string;
  name: string;
  description: string;
  color: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaignNotes, setCampaignNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ dice: string; result: number } | null>(null);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  
  // Estado para Combate Ativo
  const [combatActive, setCombatActive] = useState(false);
  const [combatants, setCombatants] = useState<Combatant[]>([
    { id: '1', name: 'Aragorn', initiative: 18, hpCurrent: 42, hpMax: 42, type: 'player', conditions: [], ac: 16 },
    { id: '2', name: 'Goblin Arqueiro', initiative: 15, hpCurrent: 7, hpMax: 7, type: 'monster', conditions: ['Ferido'], ac: 13 },
    { id: '3', name: 'Legolas', initiative: 22, hpCurrent: 28, hpMax: 28, type: 'player', conditions: [], ac: 15 },
  ]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  
  // Estado para Party
  const [playerCharacters, setPlayerCharacters] = useState<PlayerCharacter[]>([
    { id: '1', name: 'Aragorn', class: 'Guerreiro', level: 5, hpCurrent: 42, hpMax: 42, conditions: [], ac: 16 },
    { id: '2', name: 'Legolas', class: 'Arqueiro', level: 5, hpCurrent: 28, hpMax: 28, conditions: [], ac: 15 },
    { id: '3', name: 'Gandalf', class: 'Mago', level: 5, hpCurrent: 22, hpMax: 22, conditions: ['Fatigado'], ac: 12 },
  ]);

  // Estado para Status
  const [statusSearch, setStatusSearch] = useState("");
  const [filteredStatusTypes, setFilteredStatusTypes] = useState<StatusType[]>([]);
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentCombatantForStatus, setCurrentCombatantForStatus] = useState<Combatant | null>(null);

  // Carregar dados
  useEffect(() => {
    checkAuthAndLoadData();
  }, [navigate]);

  useEffect(() => {
    loadStatusTypes();
  }, []);

  useEffect(() => {
    if (statusSearch.trim() === "") {
      setFilteredStatusTypes(statusTypes);
    } else {
      const filtered = statusTypes.filter(status =>
        status.name.toLowerCase().includes(statusSearch.toLowerCase()) ||
        status.description.toLowerCase().includes(statusSearch.toLowerCase())
      );
      setFilteredStatusTypes(filtered);
    }
  }, [statusSearch, statusTypes]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const currentCampaignId = localStorage.getItem('current-campaign');
      if (!currentCampaignId) {
        navigate('/campaign-select');
        return;
      }
      
      await loadCurrentCampaign(currentCampaignId);
      await loadCampaignNotes();
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error("Erro ao carregar dados da campanha");
      setLoading(false);
    }
  };

  const loadCurrentCampaign = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("Campanha não encontrada");
        }
        navigate('/campaign-select');
        return;
      }

      if (data) {
        setCurrentCampaign(data);
        toast.success(`Bem-vindo à campanha: ${data.name}`);
      }
    } catch (error) {
      toast.error("Erro ao carregar campanha");
      navigate('/campaign-select');
    }
  };

  const loadCampaignNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('campaign_notes')
        .select('notes')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setCampaignNotes(data.notes);
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const saveCampaignNotes = async () => {
    try {
      setSavingNotes(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('campaign_notes')
        .upsert({
          user_id: user.id,
          notes: campaignNotes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success("Anotações salvas!");
    } catch (error: any) {
      toast.error("Erro ao salvar anotações");
    } finally {
      setSavingNotes(false);
    }
  };

  const loadStatusTypes = async () => {
    try {
      // ATENÇÃO: Verifique o nome correto da sua tabela de status
      // O erro indica que sua tabela se chama 'character_status_types', não 'status_types'
      const { data, error } = await supabase
        .from('character_status_types') // Altere para o nome correto da sua tabela
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao carregar status:', error);
        toast.error("Erro ao carregar tipos de status");
        return;
      }
      
      if (data) {
        setStatusTypes(data);
        setFilteredStatusTypes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const handleConsultStatus = (status: StatusType) => {
    setSelectedStatus(status);
  };

  // Funções de Combate
  const startCombat = () => {
    setCombatActive(true);
    setCurrentTurnIndex(0);
    toast.success("Combate iniciado!");
  };

  const endCombat = () => {
    setCombatActive(false);
    toast.success("Combate encerrado!");
  };

  const nextTurn = () => {
    setCurrentTurnIndex((prev) => (prev + 1) % combatants.length);
  };

  const previousTurn = () => {
    setCurrentTurnIndex((prev) => (prev - 1 + combatants.length) % combatants.length);
  };

  const updateHP = (id: string, amount: number) => {
    setCombatants(prev => prev.map(combatant => {
      if (combatant.id === id) {
        const newHP = Math.max(0, Math.min(combatant.hpMax, combatant.hpCurrent + amount));
        return { ...combatant, hpCurrent: newHP };
      }
      return combatant;
    }));
  };

  const updateHPByValue = (id: string, newValue: number) => {
    setCombatants(prev => prev.map(combatant => {
      if (combatant.id === id) {
        const newHP = Math.max(0, Math.min(combatant.hpMax, newValue));
        return { ...combatant, hpCurrent: newHP };
      }
      return combatant;
    }));
  };

  const addCondition = (id: string, condition: string) => {
    setCombatants(prev => prev.map(combatant => {
      if (combatant.id === id && !combatant.conditions.includes(condition)) {
        return { ...combatant, conditions: [...combatant.conditions, condition] };
      }
      return combatant;
    }));
    setShowStatusModal(false);
    toast.success(`Status ${condition} adicionado!`);
  };

  const removeCondition = (id: string, condition: string) => {
    setCombatants(prev => prev.map(combatant => {
      if (combatant.id === id) {
        return { ...combatant, conditions: combatant.conditions.filter(c => c !== condition) };
      }
      return combatant;
    }));
    toast.success(`Status ${condition} removido!`);
  };

  const openStatusModal = (combatant: Combatant) => {
    setCurrentCombatantForStatus(combatant);
    setShowStatusModal(true);
    setStatusSearch("");
  };

  // Funções de Rolagem
  const rollDice = (dice: string) => {
    const [num, sides] = dice.split('d').map(Number);
    let result = 0;
    for (let i = 0; i < num; i++) {
      result += Math.floor(Math.random() * sides) + 1;
    }
    
    setLastRoll({ dice, result });
    toast.success(`🎲 ${dice}: ${result}`);
  };

  const rollInitiative = () => {
    const updatedCombatants = combatants.map(combatant => ({
      ...combatant,
      initiative: Math.floor(Math.random() * 20) + 1
    }));
    
    // Ordenar por iniciativa (maior para menor)
    updatedCombatants.sort((a, b) => b.initiative - a.initiative);
    setCombatants(updatedCombatants);
    toast.success("Iniciativas roladas!");
  };

  const handleManualDamage = (id: string) => {
    const input = prompt("Insira o valor (negativo para dano, positivo para cura):");
    if (input) {
      const value = parseInt(input) || 0;
      updateHP(id, value);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Dices className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando campanha...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header da Campanha */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {currentCampaign?.name || "Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {currentCampaign?.system} • Gerenciamento de Sessão
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/campaign-select')}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Trocar Campanha
          </Button>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="session" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="session">Sessão Ativa</TabsTrigger>
            <TabsTrigger value="party">Party</TabsTrigger>
            <TabsTrigger value="notes">Anotações</TabsTrigger>
          </TabsList>

          {/* Tab: Sessão Ativa */}
          <TabsContent value="session" className="space-y-6">
            {/* Widget de Combate */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Swords className="w-5 h-5 text-primary" />
                    <CardTitle>Combate Ativo</CardTitle>
                    <Badge variant={combatActive ? "destructive" : "outline"}>
                      {combatActive ? "EM COMBATE" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {!combatActive ? (
                      <Button onClick={startCombat} size="sm" className="gap-2">
                        <Swords className="w-4 h-4" />
                        Iniciar Combate
                      </Button>
                    ) : (
                      <>
                        <Button onClick={rollInitiative} variant="outline" size="sm">
                          Rolar Iniciativa
                        </Button>
                        <Button onClick={endCombat} variant="destructive" size="sm">
                          Encerrar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {combatActive && (
                <CardContent>
                  {/* Controles de Turno */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
                    <Button variant="outline" onClick={previousTurn}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Turno Atual</div>
                      <div className="text-2xl font-bold">
                        {combatants[currentTurnIndex]?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Iniciativa: {combatants[currentTurnIndex]?.initiative}
                      </div>
                    </div>
                    
                    <Button variant="outline" onClick={nextTurn}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Lista de Combatentes */}
                  <div className="space-y-3">
                    {combatants.sort((a, b) => b.initiative - a.initiative).map((combatant, index) => {
                      const hpPercentage = (combatant.hpCurrent / combatant.hpMax) * 100;
                      const hpColor = 
                        hpPercentage > 75 ? "bg-green-500" :
                        hpPercentage > 50 ? "bg-yellow-500" :
                        hpPercentage > 25 ? "bg-orange-500" : "bg-red-500";
                      
                      return (
                        <div
                          key={combatant.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${
                            index === currentTurnIndex 
                              ? 'bg-primary/10 border-primary shadow-sm' 
                              : 'bg-card border-border'
                          }`}
                        >
                          {/* Lado Esquerdo: Informações */}
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              combatant.type === 'player' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {combatant.type === 'player' ? (
                                <User className="w-5 h-5" />
                              ) : (
                                <Skull className="w-5 h-5" />
                              )}
                            </div>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg truncate">{combatant.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  CA {combatant.ac}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Ini. {combatant.initiative}
                                </Badge>
                              </div>
                              
                              {/* Condições */}
                              {combatant.conditions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {combatant.conditions.map(condition => (
                                    <Badge 
                                      key={condition} 
                                      variant="secondary" 
                                      className="text-xs cursor-pointer hover:opacity-80"
                                      onClick={() => removeCondition(combatant.id, condition)}
                                    >
                                      {condition}
                                      <X className="w-3 h-3 ml-1" />
                                    </Badge>
                                  ))}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 px-2 text-xs"
                                    onClick={() => openStatusModal(combatant)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Status
                                  </Button>
                                </div>
                              )}
                              {combatant.conditions.length === 0 && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 px-2 text-xs mt-1"
                                  onClick={() => openStatusModal(combatant)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Adicionar Status
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Lado Direito: Controles de Vida */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Barra de Vida */}
                            <div className="w-full sm:w-48">
                              <div className="flex justify-between text-sm mb-1">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  <span>PV</span>
                                </div>
                                <span className="font-medium">
                                  {combatant.hpCurrent} / {combatant.hpMax}
                                </span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${hpColor} transition-all duration-300`}
                                  style={{ width: `${hpPercentage}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Controles de HP com INPUT */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const damage = parseInt(prompt(`Dano em ${combatant.name}:`) || "0");
                                    if (!isNaN(damage)) updateHP(combatant.id, -damage);
                                  }}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={combatant.hpCurrent}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0;
                                      updateHPByValue(combatant.id, value);
                                    }}
                                    className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min={0}
                                    max={combatant.hpMax}
                                  />
                                  <div className="absolute -bottom-5 left-0 right-0 text-xs text-center text-muted-foreground">
                                    de {combatant.hpMax}
                                  </div>
                                </div>
                                
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const healing = parseInt(prompt(`Cura em ${combatant.name}:`) || "0");
                                    if (!isNaN(healing)) updateHP(combatant.id, healing);
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleManualDamage(combatant.id)}
                                className="text-xs"
                              >
                                ± PV
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Rolagem Rápida e Acesso Rápido */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Rolagem Rápida */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dices className="w-5 h-5" />
                    Rolagem Rápida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '2d6', '3d6', '1d100'].map((dice) => (
                      <Button
                        key={dice}
                        onClick={() => rollDice(dice)}
                        variant="outline"
                        className="h-12"
                      >
                        {dice}
                      </Button>
                    ))}
                  </div>
                  {lastRoll && (
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-sm text-muted-foreground">Última rolagem</div>
                      <div className="text-2xl font-bold">{lastRoll.dice}: {lastRoll.result}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Acesso Rápido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Acesso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-1"
                      onClick={() => navigate('/npcs')}
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-sm">NPCs</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-1"
                      onClick={() => navigate('/history')}
                    >
                      <Scroll className="w-5 h-5" />
                      <span className="text-sm">História</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-1"
                      onClick={() => navigate('/map')}
                    >
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">Mapas</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex-col gap-1"
                      onClick={() => navigate('/rules')}
                    >
                      <Book className="w-5 h-5" />
                      <span className="text-sm">Regras</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Party */}
          <TabsContent value="party">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Status da Party
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playerCharacters.map((pc) => {
                    const hpPercentage = (pc.hpCurrent / pc.hpMax) * 100;
                    const hpColor = 
                      hpPercentage > 75 ? "bg-green-500" :
                      hpPercentage > 50 ? "bg-yellow-500" :
                      hpPercentage > 25 ? "bg-orange-500" : "bg-red-500";
                    
                    return (
                      <Card key={pc.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{pc.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {pc.class} Nv.{pc.level}
                              </p>
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <Shield className="w-3 h-3" />
                              CA {pc.ac}
                            </Badge>
                          </div>
                          
                          {/* Barra de HP */}
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-destructive" />
                                Pontos de Vida
                              </span>
                              <span>{pc.hpCurrent}/{pc.hpMax}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${hpColor} transition-all`}
                                style={{ width: `${hpPercentage}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Condições */}
                          {pc.conditions.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground mb-1">Condições:</div>
                              <div className="flex flex-wrap gap-1">
                                {pc.conditions.map(cond => (
                                  <Badge key={cond} variant="secondary" className="text-xs">
                                    {cond}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => navigate(`/character/${pc.id}`)}
                          >
                            Ver Ficha Completa
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Anotações */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Anotações da Campanha</CardTitle>
                <CardDescription>
                  Ideias, plot points e informações importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={campaignNotes}
                  onChange={(e) => setCampaignNotes(e.target.value)}
                  placeholder="Digite suas anotações aqui..."
                  className="min-h-[400px]"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setCampaignNotes("")}>
                    Limpar
                  </Button>
                  <Button onClick={saveCampaignNotes} disabled={savingNotes} className="gap-2">
                    <Save className="w-4 h-4" />
                    {savingNotes ? "Salvando..." : "Salvar Anotações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Status - IGUAL AO DA TELA INITIATIVE */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>
              Adicionar Status - {currentCombatantForStatus?.name}
            </DialogTitle>
            <DialogDescription>
              Selecione um status para aplicar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar status..."
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Lista de Status */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredStatusTypes.map((status) => (
                <div
                  key={status.id}
                  className="p-3 border border-border/50 rounded-lg hover:bg-primary/5 
                           hover:border-primary/50 cursor-pointer transition-all duration-200
                           bg-card/50"
                  onClick={() => currentCombatantForStatus && addCondition(currentCombatantForStatus.id, status.name)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="font-medium text-foreground">{status.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {status.description}
                  </p>
                </div>
              ))}
              
              {filteredStatusTypes.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    {statusSearch ? 'Nenhum status encontrado' : 'Nenhum status cadastrado'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Consulta de Status Detalhada */}
            {selectedStatus && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedStatus.color }}
                  />
                  <h3 className="font-bold text-lg text-foreground">{selectedStatus.name}</h3>
                </div>
                
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-foreground/80">{selectedStatus.description}</p>
                </div>
                
                <Button
                  onClick={() => setSelectedStatus(null)}
                  variant="outline"
                  className="w-full"
                >
                  Voltar para a lista
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;