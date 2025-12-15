import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dices, Plus, Trash2, Heart, Shield, Search, ArrowLeft, X, Play, RotateCcw, Clock, SkipForward, MapPin,Book,Swords,User,Users, BookOpen,Zap,ChevronRight } from "lucide-react";

interface InitiativeCharacter {
  id: string;
  name: string;
  initiative_value: number;
  position: number;
  current_hp: number;   
  max_hp: number;
  armor_class: number;
  notes: string;
  character_type: 'player' | 'npc';
  statuses: CharacterStatus[];
  campaign_id?: string;
  source_character_id?: string;
}

interface BaseCharacter {
  id: string;
  name: string;
  current_hp?: number | null;
  max_hp?: number | null;
  armor_class?: number | null;
}

interface CharacterStatus {
  id: string;
  status_type: {
    name: string;
    color: string;
    description: string;
  };
  duration?: number;
  notes: string;
}

interface PlayerCharacter extends BaseCharacter {
  character_class?: string | null;
  level?: number | null;
}

interface NpcCharacter extends BaseCharacter {
  fortitude_save?: number | null;
  reflex_save?: number | null;
  will_save?: number | null;
  perception?: number | null;
  attacks?: string | null;
}

// Tipo para os status
interface StatusType {
  id: string; // Alterado para string pois no Supabase geralmente são UUIDs
  name: string;
  color: string;
  description: string;
  created_at?: string;
}

interface LastRoll {
  dice: string;
  result: number;
}

const Initiative = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<InitiativeCharacter[]>([]);
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<InitiativeCharacter | null>(null);
  const [searchStatus, setSearchStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [draggedCharacter, setDraggedCharacter] = useState<string | null>(null);

  // Estados para combate
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [totalTurns, setTotalTurns] = useState<number>(0);
  const [combatStarted, setCombatStarted] = useState<boolean>(false);
  const [combatTime, setCombatTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estado para rolagem de dados
  const [lastRoll, setLastRoll] = useState<LastRoll | null>(null);
  
  // Estados para personagens disponíveis
  const [availableCharacters, setAvailableCharacters] = useState<(PlayerCharacter | NpcCharacter)[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const [formData, setFormData] = useState({
    name: "",
    initiative_value: 0,
    current_hp: 0,
    max_hp: 0,
    armor_class: 10,
    notes: "",
    character_type: "player" as 'player' | 'npc',
    source_character_id: "",
  });
  
  const [statusFormData, setStatusFormData] = useState({
    status_type_id: "",
    duration: 0,
    notes: "",
  });

  // Filtragem dos status
  const filteredStatusTypes = statusTypes.filter(status =>
    status.name.toLowerCase().includes(searchStatus.toLowerCase()) ||
    status.description.toLowerCase().includes(searchStatus.toLowerCase())
  );

  // Função para consultar status
  const handleConsultStatus = (status: StatusType) => {    
    setSelectedStatus(status);
  };

  // Adicionar debug para verificar a campanha atual
  useEffect(() => {
    const campaignId = localStorage.getItem('current-campaign');
  }, []);

  const fetchAvailableCharacters = async (type: 'player' | 'npc') => {
    try {
      setLoadingCharacters(true);
      const campaignId = localStorage.getItem('current-campaign');
      
      if (!campaignId) {
        toast.error("Nenhuma campanha selecionada");
        return;
      }
  
      if (type === 'player') {
        const { data, error } = await supabase
          .from('players')
          .select('id, name, hp_current, hp_max, ac')
          .eq('campaign_id', campaignId)
          .order('name');
  
        if (error) throw error;
        
        const mappedData = (data || []).map(player => ({
          id: player.id,
          name: player.name,
          current_hp: player.hp_current,
          max_hp: player.hp_max,
          armor_class: player.ac
        }));
        
        setAvailableCharacters(mappedData);
      } else {
        const { data, error } = await supabase
          .from('npcs')
          .select('id, name, current_hp, max_hp, armor_class')
          .eq('campaign_id', campaignId)
          .order('name');
  
        if (error) throw error;
        setAvailableCharacters(data || []);
      }
    } catch (error: any) {
      toast.error("Erro ao buscar personagens");
    } finally {
      setLoadingCharacters(false);
    }
  };
  
  // rolagem dos dados
  const rollDice = (dice: string) => {
    let result = 0;
    
    if (dice === '1d20') {
      result = Math.floor(Math.random() * 20) + 1;
    } else if (dice === '1d6') {
      result = Math.floor(Math.random() * 6) + 1;
    } else if (dice === '1d8') {
      result = Math.floor(Math.random() * 8) + 1;
    } else if (dice === '1d100') {
      result = Math.floor(Math.random() * 100) + 1;
    } else if (dice === '1d4') {
      result = Math.floor(Math.random() * 4) + 1;
    } else if (dice === '1d12') {
      result = Math.floor(Math.random() * 12) + 1;
    }
    
    setLastRoll({ dice, result });
  };
  useEffect(() => {
    if (dialogOpen) {
      // Carrega os personagens do tipo atual quando o diálogo abre
      if (formData.character_type) {
        fetchAvailableCharacters(formData.character_type);
      }
    }
  }, [dialogOpen]);

  // Efeito para controlar o timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setCombatTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await Promise.all([fetchCharacters(), fetchStatusTypes()]);
  };

  const fetchCharacters = async () => {
    try {
      const campaignId = localStorage.getItem('current-campaign');
      
      if (!campaignId) {
        toast.error("Nenhuma campanha selecionada");
        setCharacters([]);
        setLoading(false);
        return;
      }
  
      // Buscar iniciativas
      const { data: initiatives, error } = await supabase
        .from("initiative_entries")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("initiative_value", { ascending: false })
        .order("position", { ascending: true });

      if (error) {
        throw error;
      }

      // Se não houver iniciativas, retornar array vazio
      if (!initiatives || initiatives.length === 0) {
        setCharacters([]);
        setLoading(false);
        return;
      }

      // Buscar TODOS os status de uma vez
      const initiativeIds = initiatives.map(char => char.id);
      
      const { data: allStatuses, error: statusError } = await supabase
        .from("initiative_character_status")
        .select(`
          id,
          initiative_id,
          duration,
          notes,
          status_type_id,
          character_status_types (
            id,
            name,
            color,
            description
          )
        `)
        .in("initiative_id", initiativeIds);

      if (statusError) {
        console.error('❌ Erro ao buscar status:', statusError);
      }

      // Combinar os dados
      const charactersWithStatuses = initiatives.map(character => {
        // Filtrar status deste personagem
        const characterStatuses = (allStatuses || [])
          .filter(status => status.initiative_id === character.id)
          .map(status => {
            // Ajustar para acessar o objeto correto
            const statusType = status.character_status_types;
            
            return {
              id: status.id,
              duration: status.duration,
              notes: status.notes,
              status_type: statusType ? {
                name: statusType.name,
                color: statusType.color,
                description: statusType.description
              } : {
                name: "Desconhecido",
                color: "#cccccc",
                description: "Status não encontrado"
              }
            };
          });

        return {
          ...character,
          statuses: characterStatuses,
        };
      });

      setCharacters(charactersWithStatuses);
      
    } catch (error: any) {
      console.error("Erro ao carregar lista de iniciativa:", error);
      toast.error("Erro ao carregar lista de iniciativa");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusTypes = async () => {
    try {
  
      const testQuery = await supabase
        .from('character_status_types')
        .select('count', { count: 'exact', head: true });
 
      // Teste 3: Consulta completa
      const { data, error, status, statusText } = await supabase
        .from('character_status_types')
        .select('id, name, color, description')
        .order('name');
                  
      if (error) {
        console.error('❌ Erro detalhado:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // Fallback imediato em caso de erro
        useFallback();
        return;
      }
      
      if (data && data.length > 0) {
        setStatusTypes(data);
      } else {
        
        useFallback();
      }
      
    } catch (error: any) {
      console.error('💥 Erro catch:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      useFallback();
    }
  };
  
  // Função auxiliar para fallback
  const useFallback = () => {

    const sampleData = [
      {
        id: "fallback-1",
        name: "Incapacitado",
        color: "#dc2626",
        description: "Personagem não pode realizar ações"
      },
      {
        id: "fallback-2",
        name: "Sangrando",
        color: "#ef4444",
        description: "Perde 1d4 pontos de vida por turno"
      },
      {
        id: "fallback-3",
        name: "Envenenado",
        color: "#10b981",
        description: "Sofre dano de veneno a cada rodada"
      },
      {
        id: "fallback-4",
        name: "Amedrontado",
        color: "#8b5cf6",
        description: "Não pode se aproximar da fonte do medo"
      }
    ];
    
    setStatusTypes(sampleData);
  };
  
  // Função para verificar permissões
 

  // Funções para controle de combate
  const startCombat = () => {
    if (characters.length === 0) {
      toast.error("Adicione personagens à iniciativa antes de iniciar o combate");
      return;
    }
    
    setCombatStarted(true);
    setTimerActive(true);
    setCurrentTurn(1);
    setTotalTurns(1);
    setCombatTime(0);
  };

  const nextTurn = () => {
    if (!combatStarted) {
      toast.error("Inicie o combate primeiro");
      return;
    }

    if (currentTurn >= characters.length) {
      setCurrentTurn(1);
      setTotalTurns(prev => prev + 1);
      toast.success(`🎉 Rodada ${totalTurns + 1} iniciada!`);
    } else {
      setCurrentTurn(prev => prev + 1);
    }
  };

  const resetCombat = () => {
    setCombatStarted(false);
    setTimerActive(false);
    setCurrentTurn(0);
    setTotalTurns(0);
    setCombatTime(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent, characterId: string) => {
    setDraggedCharacter(characterId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetCharacterId: string) => {
    e.preventDefault();
    if (!draggedCharacter || draggedCharacter === targetCharacterId) return;

    const draggedIndex = characters.findIndex(c => c.id === draggedCharacter);
    const targetIndex = characters.findIndex(c => c.id === targetCharacterId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const updatedCharacters = [...characters];
    const [draggedItem] = updatedCharacters.splice(draggedIndex, 1);
    updatedCharacters.splice(targetIndex, 0, draggedItem);

    try {
      const updatePromises = updatedCharacters.map((character, index) =>
        supabase
          .from("initiative_entries")
          .update({ position: index + 1 })
          .eq("id", character.id)
      );

      await Promise.all(updatePromises);
      setCharacters(updatedCharacters);
      toast.success("Ordem atualizada!");
    } catch (error: any) {
      toast.error("Erro ao reordenar iniciativa");
    }

    setDraggedCharacter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
  
      const campaignId = localStorage.getItem('current-campaign');
      if (!campaignId) {
        toast.error("Nenhuma campanha selecionada");
        return;
      }
  
      const entriesToAdd = [];
      const baseName = formData.name;
      const currentPosition = characters.length;
      
      if (quantity > 1 && formData.character_type !== 'manual' && formData.source_character_id) {
        for (let i = 1; i <= quantity; i++) {
          entriesToAdd.push({
            name: `${baseName} ${i}`,
            initiative_value: formData.initiative_value,
            current_hp: formData.current_hp,
            max_hp: formData.max_hp,
            armor_class: formData.armor_class,
            notes: formData.notes,
            character_type: formData.character_type,
            user_id: user.id,
            campaign_id: campaignId,
            position: currentPosition + i,
            source_character_id: formData.source_character_id,
          });
        }
      } else {
        entriesToAdd.push({
          name: baseName,
          initiative_value: formData.initiative_value,
          current_hp: formData.current_hp,
          max_hp: formData.max_hp,
          armor_class: formData.armor_class,
          notes: formData.notes,
          character_type: formData.character_type,
          user_id: user.id,
          campaign_id: campaignId,
          position: currentPosition + 1,
          source_character_id: formData.source_character_id || null,
        });
      }
  
      const { error } = await supabase.from("initiative_entries").insert(entriesToAdd);
      if (error) throw error;
  
      toast.success(`${entriesToAdd.length} personagem(s) adicionado(s) à iniciativa!`);
      setDialogOpen(false);
      resetForm();
      setQuantity(1);
      fetchCharacters();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar personagem");
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter) return;

    try {
      const { error } = await supabase
        .from("initiative_character_status")
        .insert({
          initiative_id: selectedCharacter.id,
          status_type_id: statusFormData.status_type_id,
          duration: statusFormData.duration || null,
          notes: statusFormData.notes,
        });

      if (error) throw error;

      toast.success("Status adicionado!");
      setStatusDialogOpen(false);
      resetStatusForm();
      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao adicionar status");
    }
  };

  const handleRemoveStatus = async (statusId: string) => {
    try {
      const { error } = await supabase
        .from("initiative_character_status")
        .delete()
        .eq("id", statusId);

      if (error) throw error;

      toast.success("Status removido!");
      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao remover status");
    }
  };

  const handleUpdateHP = async (characterId: string, newHP: number) => {
    try {
      const { error } = await supabase
        .from("initiative_entries")
        .update({ current_hp: newHP })
        .eq("id", characterId);

      if (error) throw error;

      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao atualizar HP");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este personagem da iniciativa?")) return;

    try {
      const { error } = await supabase.from("initiative_entries").delete().eq("id", id);
      if (error) throw error;
      toast.success("Personagem removido!");
      fetchCharacters();
    } catch (error: any) {
      toast.error("Erro ao remover personagem");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      initiative_value: 0,
      current_hp: 0,
      max_hp: 0,
      armor_class: 10,
      notes: "",
      character_type: "player",
      source_character_id: "",
    });
  };

  const resetStatusForm = () => {
    setStatusFormData({
      status_type_id: "",
      duration: 0,
      notes: "",
    });
    setSelectedCharacter(null);
  };

  const menuItems = [
    {
      title: "NPCs",
      description: "Gerencie seus NPCs",
      icon: Users,
      path: "/npcs",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Aventureiros",
      description: "Gerencie seus jogadores",
      icon: User,
      path: "/players",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Anotações",
      description: "Gerencie suas anotações",
      icon: BookOpen,
      path: "/dashboard",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Mapas",
      description: "Consule mapas",
      icon: MapPin,
      path: "*",
      gradient: "from-secondary to-accent",
    },   
    {
      title: "Regras",
      description: "Em desenvolvimento - Em breve!", 
      icon: Book,
      path: "#",
      gradient: "from-secondary to-accent", 
      disabled: true
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Dices className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="dashboard" backgroundIntensity="low">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 
                            border border-primary/20">
                <Swords className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent 
                                 bg-clip-text text-transparent">
                    Lista de Iniciativa
                  </span>
                </h2>
                <p className="text-muted-foreground">Organize e gerencie os turnos de combate</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {!combatStarted ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    onClick={startCombat}
                    className="bg-gradient-to-r from-primary to-accent 
                            hover:from-primary/90 hover:to-accent/90
                            border border-primary/30
                            shadow-lg hover:shadow-xl hover:shadow-primary/20"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar Combate
                  </Button>
                  
                  <Button 
                    onClick={() => setDialogOpen(true)}
                    className="bg-gradient-to-r from-primary to-accent 
                            hover:from-primary/90 hover:to-accent/90
                            border border-primary/30
                            shadow-lg hover:shadow-xl hover:shadow-primary/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar NPC/Player
                  </Button>               
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Button 
                    onClick={resetCombat}
                    variant="outline"
                    className="border-2 border-border hover:border-primary/50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Parar
                  </Button>
                  
                  <Button 
                    onClick={nextTurn}
                    className="bg-gradient-to-r from-primary to-accent 
                            hover:from-primary/90 hover:to-accent/90
                            border border-primary/30
                            shadow-lg hover:shadow-xl hover:shadow-primary/20"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Próximo Turno
                  </Button>
                  
                  <Button 
                    onClick={() => setDialogOpen(true)}
                    className="bg-gradient-to-r from-primary to-accent 
                            hover:from-primary/90 hover:to-accent/90
                            border border-primary/30
                            shadow-lg hover:shadow-xl hover:shadow-primary/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add 
                  </Button>
                </div>
              )}
            </div>
          </div>
         
  
          {/* Card de Status do Combate */}
          {combatStarted && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{currentTurn}</div>
                    <div className="text-sm text-muted-foreground mt-1">Turno Atual</div>
                    <div className="text-sm font-medium mt-2 truncate">
                      {characters[currentTurn - 1]?.name || '--'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{totalTurns}</div>
                    <div className="text-sm text-muted-foreground mt-1">Rodada</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-green-600">
                      <Clock className="w-6 h-6" />
                      {formatTime(combatTime)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Tempo de Combate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
  
          {/* Lista de Personagens */}
          <div className="space-y-4">
            {characters.map((character, index) => (
              <div
                key={character.id}
                draggable
                onDragStart={(e) => handleDragStart(e, character.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, character.id)}
                className={`cursor-move transition-all duration-200 hover:scale-[1.02] ${
                  combatStarted && currentTurn === index + 1 
                    ? 'ring-2 ring-primary ring-opacity-50 rounded-lg' 
                    : ''
                }`}
              >
                <Card className={`border-2 border-border bg-card/80 hover:bg-card transition-all duration-300
                               hover:shadow-[0_4px_20px_hsl(var(--primary)_/_0.1)] ${
                  combatStarted && currentTurn === index + 1 
                    ? 'border-primary shadow-lg' 
                    : 'hover:border-primary/50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          combatStarted && currentTurn === index + 1
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-primary/10 border-primary/30'
                        }`}>
                          <span className="font-bold text-lg">{index + 1}</span>
                        </div>
  
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate">{character.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={character.character_type === 'player' 
                                ? "bg-green-500/20 text-green-600 border-green-500" 
                                : "bg-purple-500/20 text-purple-600 border-purple-500"
                              }
                            >
                              {character.character_type === 'player' ? 'Jogador' : 'NPC'}
                            </Badge>
                            {combatStarted && currentTurn === index + 1 && (
                              <Badge className="bg-primary text-primary-foreground animate-pulse">
                                TURNO ATUAL
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Iniciativa: {character.initiative_value}
                          </p>
                        </div>
                      </div>
  
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={character.current_hp}
                              onChange={(e) => handleUpdateHP(character.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-center"
                            />
                            <span className="text-muted-foreground">/</span>
                            <span className="w-10">{character.max_hp}</span>
                          </div>
                        </div>
  
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{character.armor_class}</span>
                        </div>
  
                        <div className="flex items-center gap-2">
                          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCharacter(character)}
                                className="h-8 border-border hover:border-primary/50"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 
                                                    shadow-[var(--shadow-glow)] max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-xl">
                                  Adicionar Status
                                </DialogTitle>
                                <DialogDescription>
                                  Adicione um status a {selectedCharacter?.name}
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleAddStatus} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="status_type" className="text-foreground/90">Tipo de Status</Label>
                                  <select
                                    id="status_type"
                                    value={statusFormData.status_type_id}
                                    onChange={(e) => setStatusFormData({ ...statusFormData, status_type_id: e.target.value })}
                                    className="w-full p-2 border border-border/50 rounded-md bg-card 
                                             focus:border-primary focus:outline-none"
                                    required
                                  >
                                    <option value="">Selecione um status</option>
                                    {statusTypes.map((status) => (
                                      <option key={status.id} value={status.id}>
                                        {status.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                                               
                                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent 
                                                               hover:from-primary/90 hover:to-accent/90
                                                               border border-primary/30 shadow-lg">
                                  Adicionar Status
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
  
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(character.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
  
                    {character.statuses.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {character.statuses.map((status) => (
                          <Badge
                            key={status.id}
                            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ 
                              backgroundColor: status.status_type.color + '20',
                              borderColor: status.status_type.color,
                              color: status.status_type.color
                            }}
                            onClick={() => {
                              // Criar um objeto StatusType a partir dos dados do status
                              const statusType: StatusType = {
                                id: status.status_type.name, // Usar name como ID temporário
                                name: status.status_type.name,
                                color: status.status_type.color,
                                description: status.status_type.description
                              };
                              handleConsultStatus(statusType);
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: status.status_type.color }}
                            />
                            {status.status_type.name}
                            {status.duration && ` (${status.duration})`}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStatus(status.id);
                              }}
                              className="ml-1 hover:bg-black/50 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
  
                    {character.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-card/50 border border-border/50">
                        <p className="text-sm text-foreground/80">
                          <span className="font-medium text-foreground">Notas:</span> {character.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
  
            {characters.length === 0 && (
              <Card className="border-2 border-dashed border-border/50 bg-card/50">
                <CardContent className="py-12 text-center">
                  <Swords className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">Nenhum personagem na iniciativa</p>
                  <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="border-primary/30 hover:border-primary/50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Personagem
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
  
         
        </div>
  
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
        
        {/* Rolagem de dados */}
        <Card className="border-2 border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dices className="w-5 h-5 text-primary" />
                  <span>Rolagem Rápida</span>
                </CardTitle>
                <CardDescription>
                  Role dados rapidamente durante a sessão
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Botões de Dados */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {[
                    { dice: '1d4', label: '1d4' },
                    { dice: '1d6', label: '1d6' },
                    { dice: '1d8', label: '1d8' },
                    { dice: '1d12', label: '1d12' },
                    { dice: '1d20', label: '1d20' },
                    { dice: '1d100', label: '1d100' },
                  ].map(({ dice, label }) => (
                    <Button
                      key={dice}
                      onClick={() => rollDice(dice)}
                      variant="outline"
                      className="bg-primary/5 hover:bg-primary/10 border-2 border-primary/20 
                                hover:border-primary/50 transition-all duration-200 
                                min-w-[70px] text-sm py-3 h-auto"
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Última Rolagem */}
                {/* Resultado */}
            <div className="text-center p-3 rounded-lg bg-card border border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Última rolagem</div>
              {lastRoll ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground">{lastRoll.dice}</span>
                    <span className="text-2xl font-bold text-primary">{lastRoll.result}</span>
                  </div>
                  {lastRoll.result === 20 && (
                    <span className="inline-block text-xs bg-yellow-500/20 text-yellow-600 
                                  px-2 py-1 rounded-full animate-pulse">
                      🎯 Crítico!
                    </span>
                  )}
                  {lastRoll.result === 1 && (
                    <span className="inline-block text-xs bg-red-500/20 text-red-600 
                                  px-2 py-1 rounded-full">
                      💥 Falha!
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">--</span>
              )}
            </div>

              </CardContent>
            </Card>
          {/* Consulta de Status */}
          <Card className="border-2 border-border bg-card/80">
            <CardHeader className="p-6 border-b border-border/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-secondary" />
                  <span>Consulta de Status</span>
                </div>
                {selectedStatus && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedStatus(null)}
                    className="h-6 w-6 hover:bg-primary/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Consulte a descrição dos status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              
              {!selectedStatus ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Procurar status..."
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="pl-9 border-border/50 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {filteredStatusTypes.map((status) => (
                      <div
                        key={status.id}
                        className="p-3 border border-border/50 rounded-lg hover:bg-primary/5 
                                 hover:border-primary/50 cursor-pointer transition-all duration-200
                                 bg-card/50"
                        onClick={() => handleConsultStatus(status)}
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
                          {searchStatus ? 'Nenhum status encontrado' : 'Nenhum status cadastrado'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
                    className="w-full border-border hover:border-primary/50"
                  >
                    Voltar para a lista
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
  
        
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                </DialogTrigger>
                <DialogContent className="bg-card rounded-lg border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      Adicionar à Iniciativa
                    </DialogTitle>
                    <DialogDescription>
                      Adicione um personagem à lista de iniciativa
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="character_type" className="text-foreground/90">Tipo de Personagem</Label>
                        <select
                          id="character_type"
                          value={formData.character_type}
                          onChange={async (e) => {
                            const newType = e.target.value as 'player' | 'npc';
                            setFormData({ 
                              ...formData, 
                              character_type: newType,
                              source_character_id: "",
                              name: "",
                              current_hp: 0,
                              max_hp: 0,
                              armor_class: 10
                            });
                            await fetchAvailableCharacters(newType);
                          }}
                          className="w-full p-2 border border-border/50 rounded-md bg-card 
                                   focus:border-primary focus:outline-none"
                        >
                          <option value="player">Jogador</option>
                          <option value="npc">NPC</option>                         
                        </select>
                      </div>
  
                      {formData.character_type !== 'manual' && (
                        <div className="space-y-2">
                          <Label htmlFor="character_select" className="text-foreground/90">
                            Selecionar Personagem
                          </Label>
                          {loadingCharacters ? (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">Carregando personagens...</p>
                            </div>
                          ) : (
                            <select
                              id="character_select"
                              value={formData.source_character_id}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                if (selectedId === "") {
                                  // Se selecionar "Selecione um personagem", limpa os dados
                                  setFormData({
                                    ...formData,
                                    source_character_id: "",
                                    name: "",
                                    current_hp: 0,
                                    max_hp: 0,
                                    armor_class: 10
                                  });
                                } else {
                                  const selectedCharacter = availableCharacters.find(char => char.id === selectedId);
                                  
                                  if (selectedCharacter) {
                                    setFormData({
                                      ...formData,
                                      source_character_id: selectedId,
                                      name: selectedCharacter.name,
                                      current_hp: selectedCharacter.current_hp || 0,
                                      max_hp: selectedCharacter.max_hp || 0,
                                      armor_class: selectedCharacter.armor_class || 10
                                    });
                                  }
                                }
                              }}
                              className="w-full p-2 border border-border/50 rounded-md bg-card 
                                      focus:border-primary focus:outline-none"
                            >
                              <option value="">Selecione um personagem</option> {/* Esta sempre será a opção padrão */}
                              {availableCharacters.map((character) => (
                                <option key={character.id} value={character.id}>
                                  {character.name} (HP: {character.current_hp || 0}/{character.max_hp || 0}, CA: {character.armor_class || 10})
                                </option>
                              ))}
                            </select>
                          )}
                          {availableCharacters.length === 0 && !loadingCharacters && (
                            <p className="text-sm text-muted-foreground">
                              Nenhum {formData.character_type === 'player' ? 'jogador' : 'NPC'} encontrado
                            </p>
                          )}
                        </div>
                      )}
                    </div>
  
                    {(formData.character_type !== 'manual' && formData.source_character_id) && (
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-foreground/90">Quantidade</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max="20"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-24 border-border/50 focus:border-primary"
                          />
                          <span className="text-sm text-muted-foreground">
                            Adicionar múltiplas cópias
                          </span>
                        </div>
                      </div>
                    )}
  
                    {(formData.character_type === 'manual' || !formData.source_character_id) && (
                      <>
                      
                        
                        
                          
                        
                        
                      </>
                    )}
  
                    <div className="space-y-2">
                      <Label htmlFor="initiative_value" className="text-foreground/90">Iniciativa *</Label>
                      <Input
                        id="initiative_value"
                        type="number"
                        value={formData.initiative_value}
                        onChange={(e) => setFormData({ ...formData, initiative_value: parseInt(e.target.value) || 0 })}
                        className="border-border/50 focus:border-primary"
                        required
                      />
                    </div>                
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent 
                                                   hover:from-primary/90 hover:to-accent/90
                                                   border border-primary/30 shadow-lg">
                      Adicionar à Iniciativa
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
    </Layout>
  );
};

export default Initiative;