// src/pages/Players.tsx - Versão com Upload de Imagem
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dices, 
  Plus, 
  Pencil, 
  Trash2, 
  User, 
  Heart,
  Shield,
  Eye,
  Brain,
  Sword,
  Zap,
  ChevronRight,
  ScrollText,
  Wand2,
  Footprints,
  Users,
  X,
  Swords as SwordIcon,
  Shield as ShieldIcon,
  Zap as ZapIcon
} from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Player {
  id: string;
  campaign_id: string;
  user_id: string;
  name: string;
  character_class?: string | null;
  level?: number | null;
  attributes: any;
  hp_current?: number | null;
  hp_max?: number | null;
  ac?: number | null;
  notes?: string | null;
  fortitude_save?: number | null;
  reflex_save?: number | null;
  will_save?: number | null;
  perception?: number | null;
  observation?: string | null;
  image_url?: string | null;
  iimage_path?: string | null; // Mantenha apenas este se já existe
  created_at: string;
  updated_at: string;
}

const Players = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  
  // Estado para o upload de imagem
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    character_class: "",
    level: "1",
    attributes: "{}",
    hp_current: "",
    hp_max: "",
    ac: "10",
    notes: "",
    fortitude_save: "0",
    reflex_save: "0",
    will_save: "0",
    perception: "0",
    observation: "",
    image_url: ""
  });

  useEffect(() => {
    const campaignId = localStorage.getItem('current-campaign');
    setCurrentCampaignId(campaignId);
    
    if (campaignId) {
      fetchPlayers(campaignId);
    } else {
      toast.error("Nenhuma campanha selecionada");
      setLoading(false);
    }
  }, []);

  const fetchPlayers = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPlayers(data || []);
    } catch (error) {
      console.error("Erro ao carregar Players:", error);
      toast.error("Erro ao carregar Players");
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer upload da imagem para o Supabase Storage
  const uploadImageToStorage = async (file: File, playerId?: string) => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${playerId || 'player'}_${Date.now()}.${fileExt}`;
      const filePath = `players/${fileName}`;

      const { data, error } = await supabase.storage
        .from('players-images') // Bucket para imagens de players
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('players-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Função para deletar imagem do Storage
  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/storage/v1/object/public/');
      if (urlParts.length < 2) return;
      
      const pathParts = urlParts[1].split('/');
      const bucketName = pathParts[0];
      const fileName = pathParts.slice(1).join('/');
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);
        
      if (error) {
        console.log('Erro ao deletar imagem:', error);
      }
    } catch (error) {
      console.log('Erro ao processar URL da imagem:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentCampaignId) {
        toast.error("Nenhuma campanha selecionada");
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      let imageUrl = formData.image_url;

      // Upload da imagem se foi selecionada uma nova
      if (selectedImage) {
        const uploadedUrl = await uploadImageToStorage(selectedImage, editingPlayer?.id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Se está editando e houve mudança de imagem
      if (editingPlayer && editingPlayer.image_url && imageUrl !== editingPlayer.image_url) {
        if (editingPlayer.image_url.includes('storage.supabase.com')) {
          await deleteImageFromStorage(editingPlayer.image_url);
        }
      }

      const playerData = {
        campaign_id: currentCampaignId,
        user_id: user.id,
        name: formData.name,
        character_class: formData.character_class || null,
        level: parseInt(formData.level) || 1,
        attributes: formData.attributes ? JSON.parse(formData.attributes) : {},
        hp_current: parseInt(formData.hp_current) || 0,
        hp_max: parseInt(formData.hp_max) || 0,
        ac: parseInt(formData.ac) || 10,
        notes: formData.notes,
        fortitude_save: parseInt(formData.fortitude_save) || 0,
        reflex_save: parseInt(formData.reflex_save) || 0,
        will_save: parseInt(formData.will_save) || 0,
        perception: parseInt(formData.perception) || 0,
        observation: formData.observation,
        image_url: imageUrl
      };

      let result;
      if (editingPlayer) {
        const { data, error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        setPlayers(players.map(player => player.id === editingPlayer.id ? data : player));
        toast.success("Player atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from('players')
          .insert([playerData])
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        setPlayers([result, ...players]);
        toast.success("Player criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar Player:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      character_class: player.character_class || "",
      level: (player.level || 1).toString(),
      attributes: typeof player.attributes === 'string' ? player.attributes : 
                 JSON.stringify(player.attributes || {}, null, 2),
      hp_current: (player.hp_current || 0).toString(),
      hp_max: (player.hp_max || 0).toString(),
      ac: (player.ac || 10).toString(),
      notes: player.notes || "",
      fortitude_save: (player.fortitude_save || 0).toString(),
      reflex_save: (player.reflex_save || 0).toString(),
      will_save: (player.will_save || 0).toString(),
      perception: (player.perception || 0).toString(),
      observation: player.observation || "",
      image_url: player.image_url || ""
    });
    
    if (player.image_url) {
      setImagePreview(player.image_url);
    } else {
      setImagePreview(null);
    }
    
    setSelectedImage(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este Player?")) return;

    try {
      const playerToDelete = players.find(player => player.id === id);
      
      if (playerToDelete?.image_url && playerToDelete.image_url.includes('storage.supabase.com')) {
        await deleteImageFromStorage(playerToDelete.image_url);
      }

      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlayers(players.filter(player => player.id !== id));
      toast.success("Player excluído com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor, selecione uma imagem (JPEG, PNG, GIF ou WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (formData.image_url) {
      setFormData({ ...formData, image_url: "" });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: "" });
  };

  const updatePlayerHP = async (playerId: string, newHp: number) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ hp_current: newHp })
        .eq('id', playerId);

      if (error) throw error;
      
      setPlayers(players.map(p => 
        p.id === playerId ? { ...p, hp_current: newHp } : p
      ));
    } catch (error) {
      toast.error("Erro ao atualizar HP");
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: "",
      character_class: "",
      level: "1",
      attributes: "{}",
      hp_current: "",
      hp_max: "",
      ac: "10",
      notes: "",
      fortitude_save: "0",
      reflex_save: "0",
      will_save: "0",
      perception: "0",
      observation: "",
      image_url: ""
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingPlayer(null);
  };

  const getHealthPercentage = (player: Player) => {
    if (!player.hp_max) return 0;
    return ((player.hp_current || 0) / player.hp_max) * 100;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Dices className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Carregando Players...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Aventureiros
                </span>
              </h2>
              <p className="text-muted-foreground">Gerencie os personagens jogadores da campanha</p>
            </div>
          </div>
          
          <button
            onClick={() => setDialogOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Player
          </button>
        </div>

        {/* LISTA DE PLAYERS */}
        {players.length === 0 ? (
          <div className="max-w-md mx-auto">
            <div 
              onClick={() => setDialogOpen(true)}
              className="border-3 border-dashed border-border hover:border-accent/50 bg-gradient-to-br from-card/30 to-card/10 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer group min-h-[400px] flex flex-col items-center justify-center p-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <User className="w-10 h-10 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                  Adicionar Primeiro Aventureiro
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Comece a gerenciar os personagens jogadores da sua campanha
                </p>
                <button className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center mx-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Player
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card para adicionar novo */}
            <div 
              onClick={() => setDialogOpen(true)}
              className="border-2 border-dashed border-border hover:border-accent/50 bg-gradient-to-br from-card/30 to-card/10 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer group min-h-[300px] flex flex-col items-center justify-center"
            >
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-accent transition-colors">
                  Novo Aventureiro
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Clique para adicionar um novo jogador à campanha
                </p>
              </div>
            </div>
            
            {/* Players existentes */}
            {players.map((player) => {
              const healthPercentage = getHealthPercentage(player);
              
              return (
                <div 
                  key={player.id} 
                  className="border-2 border-border bg-gradient-to-br from-card to-card/80 rounded-xl hover:border-accent/50 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden flex flex-col min-h-[450px]"
                >
                  {/* Banner com imagem */}
                  <div className="relative h-40 overflow-hidden">
                    {player.image_url ? (
                      <>
                        <div 
                          className="absolute inset-0 bg-center bg-cover blur-lg scale-110"
                          style={{ backgroundImage: `url(${player.image_url})` }}
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <img
                          src={player.image_url}
                          alt={player.name}
                          className="relative z-10 mx-auto h-full object-contain"
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <User className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                  </div>

                  {/* Header do card */}
                  <div className="px-4 py-3 border-b border-border bg-card/70 backdrop-blur-sm">
                    <h3 className="text-base font-semibold leading-tight truncate">
                      {player.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {player.character_class || 'Aventureiro'} • Nível {player.level || 1}
                    </p>
                  </div>

                  <div className="p-6 flex-1">
                    {/* Barra de HP */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-destructive" />
                          <span className="text-muted-foreground">Vitalidade</span>
                        </div>
                        <span className="font-medium">
                          {player.hp_current || 0}/{player.hp_max || 0}
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({Math.round(((player.hp_current || 0) / (player.hp_max || 1)) * 100)}%)
                          </span>
                        </span>
                      </div>
                      
                      <div className="relative h-2 w-full bg-red-500/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-400/20"></div>
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 rounded-full"
                          style={{ 
                            width: `${Math.max(3, ((player.hp_current || 0) / (player.hp_max || 1)) * 100)}%` 
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Shield className="w-3 h-3 text-primary" />
                          <div className="text-xs text-muted-foreground">CA</div>
                        </div>
                        <div className="text-lg font-bold bg-primary/10 py-1 rounded">{player.ac || 10}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="w-3 h-3 text-secondary" />
                          <div className="text-xs text-muted-foreground">PER</div>
                        </div>
                        <div className="text-lg font-bold bg-secondary/10 py-1 rounded">+{player.perception || 0}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap className="w-3 h-3 text-accent" />
                          <div className="text-xs text-muted-foreground">NÍVEL</div>
                        </div>
                        <div className="text-lg font-bold bg-accent/10 py-1 rounded">{player.level || 1}</div>
                      </div>
                    </div>
                    
                    {/* Salvaguardas */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Fortitude</div>
                        <div className="text-sm font-medium bg-green-500/10 text-green-500 py-1 rounded">
                          +{player.fortitude_save || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Reflexos</div>
                        <div className="text-sm font-medium bg-blue-500/10 text-blue-500 py-1 rounded">
                          +{player.reflex_save || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Vontade</div>
                        <div className="text-sm font-medium bg-purple-500/10 text-purple-500 py-1 rounded">
                          +{player.will_save || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Classe e Atributos */}
                    {player.character_class && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <ShieldIcon className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-muted-foreground">Classe</span>
                        </div>
                        <p className="text-sm bg-blue-500/10 p-2 rounded border border-blue-500/20">
                          {player.character_class}
                        </p>
                      </div>
                    )}
                    
                    {/* Atributos */}
                    {player.attributes && Object.keys(player.attributes).length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <ScrollText className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-muted-foreground">Atributos</span>
                        </div>
                        <div className="text-sm bg-green-500/10 p-2 rounded border border-green-500/20 max-h-24 overflow-y-auto">
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(player.attributes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Anotações */}
                    {player.observation && (
                      <details className="group mt-3">
                        <summary className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1 hover:text-foreground transition-colors">
                          <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                          Observações
                        </summary>
                        <div className="mt-2 text-sm bg-muted/30 p-3 rounded border border-border">
                          {player.observation}
                        </div>
                      </details>
                    )}
                    
                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {player.hp_max && player.hp_max > 30 && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">Resistente</span>
                      )}
                      {player.perception && player.perception > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">Vigilante</span>
                      )}
                      {player.level && player.level > 5 && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full">Experiente</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer com Ações */}
                  <div className="border-t border-border bg-card/50 px-4 py-3 mt-auto flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(player);
                      }}
                      className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir ${player.name}?`)) {
                          handleDelete(player.id);
                        }
                      }}
                      className="text-xs px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Modal de Adicionar/Editar */}
        {dialogOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-card rounded-2xl border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-border bg-gradient-to-r from-card to-card/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {editingPlayer ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {editingPlayer ? "Editar Player" : "Novo Player"}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {editingPlayer ? "Atualize os dados do jogador" : "Preencha os dados do novo jogador"}
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Seção: Identificação */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Identificação
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Nome *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="Nome do personagem"
                      />
                    </div>
                    <div>
                      <label htmlFor="character_class" className="block text-sm font-medium text-foreground mb-2">
                        Classe
                      </label>
                      <input
                        id="character_class"
                        type="text"
                        value={formData.character_class}
                        onChange={(e) => setFormData({ ...formData, character_class: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="Ex: Guerreiro, Mago, Clérigo"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-foreground mb-2">
                        Nível
                      </label>
                      <input
                        id="level"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="ac" className="block text-sm font-medium text-foreground mb-2">
                        Classe de Armadura (CA)
                      </label>
                      <input
                        id="ac"
                        type="number"
                        value={formData.ac}
                        onChange={(e) => setFormData({ ...formData, ac: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Imagem */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-accent flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Imagem do Personagem
                  </h4>
                  
                  {/* Preview da imagem */}
                  {(imagePreview || formData.image_url) && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <img
                        src={imagePreview || formData.image_url || ""}
                        alt="Preview da imagem"
                        className="w-full h-full object-contain bg-muted/20"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        disabled={uploadingImage}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Área de upload */}
                  <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center transition-colors">
                    <input
                      type="file"
                      id="image_upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image_upload"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {uploadingImage ? (
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Plus className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {selectedImage ? "Imagem selecionada" : uploadingImage ? "Enviando imagem..." : "Escolher imagem"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedImage 
                            ? selectedImage.name
                            : "Clique para escolher uma imagem do seu computador"
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG, GIF até 5MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Input de URL */}
                  <div>
                    <label htmlFor="image_url" className="block text-xs text-muted-foreground mb-2">
                      Ou cole uma URL de imagem:
                    </label>
                    <input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        if (e.target.value && !selectedImage) {
                          setImagePreview(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:border-primary transition-colors"
                      placeholder="https://exemplo.com/imagem.jpg"
                      disabled={!!selectedImage || uploadingImage}
                    />
                  </div>
                </div>

                {/* Seção: Vitalidade */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-destructive flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Vitalidade
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hp_current" className="block text-sm font-medium text-foreground mb-2">
                        HP Atual
                      </label>
                      <input
                        id="hp_current"
                        type="number"
                        value={formData.hp_current}
                        onChange={(e) => setFormData({ ...formData, hp_current: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="hp_max" className="block text-sm font-medium text-foreground mb-2">
                        HP Máximo
                      </label>
                      <input
                        id="hp_max"
                        type="number"
                        value={formData.hp_max}
                        onChange={(e) => setFormData({ ...formData, hp_max: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Seção: Defesas */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Defesas
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="fortitude_save" className="block text-sm font-medium text-foreground mb-2">
                        Fortitude
                      </label>
                      <input
                        id="fortitude_save"
                        type="number"
                        value={formData.fortitude_save}
                        onChange={(e) => setFormData({ ...formData, fortitude_save: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="reflex_save" className="block text-sm font-medium text-foreground mb-2">
                        Reflexos
                      </label>
                      <input
                        id="reflex_save"
                        type="number"
                        value={formData.reflex_save}
                        onChange={(e) => setFormData({ ...formData, reflex_save: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="will_save" className="block text-sm font-medium text-foreground mb-2">
                        Vontade
                      </label>
                      <input
                        id="will_save"
                        type="number"
                        value={formData.will_save}
                        onChange={(e) => setFormData({ ...formData, will_save: e.target.value })}
                        className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="perception" className="block text-sm font-medium text-foreground mb-2">
                      Percepção
                    </label>
                    <input
                      id="perception"
                      type="number"
                      value={formData.perception}
                      onChange={(e) => setFormData({ ...formData, perception: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                
                {/* Seção: Atributos */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-500 flex items-center gap-2">
                    <ScrollText className="w-4 h-4" />
                    Atributos
                  </h4>
                  <div>
                    <label htmlFor="attributes" className="block text-sm font-medium text-foreground mb-2">
                      Atributos (JSON)
                    </label>
                    <textarea
                      id="attributes"
                      value={formData.attributes}
                      onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-32 resize-none font-mono text-sm"
                      placeholder='{"forca": 10, "destreza": 12, "constituicao": 14, "inteligencia": 8, "sabedoria": 10, "carisma": 16}'
                    />
                  </div>
                </div>
                
                {/* Seção: Anotações */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-purple-500 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Anotações
                  </h4>
                  
                  <div>
                    <label htmlFor="observation" className="block text-sm font-medium text-foreground mb-2">
                      Observações do Mestre
                    </label>
                    <textarea
                      id="observation"
                      value={formData.observation}
                      onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                      placeholder="Notas, características especiais, história..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                      Notas Gerais
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                      placeholder="Equipamentos, tesouros, habilidades especiais..."
                    />
                  </div>
                </div>
                
                {/* Botões */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium"
                    disabled={uploadingImage}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] text-primary-foreground rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando imagem...
                      </span>
                    ) : editingPlayer ? (
                      "Atualizar Player"
                    ) : (
                      "Criar Player"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Players;