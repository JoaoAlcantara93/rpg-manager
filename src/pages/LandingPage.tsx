import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Map, 
  BookOpen, 
  Dice5, 
  ChevronRight, 
  Star,
  Play,
  Shield,
  Zap,
  Heart,
  Instagram,
  MessageCircle,
  Sun,
  Moon,
  Swords,
  Notebook,
  Layers,
  Target,
  Calendar,
  Book,
  Shield as BestiaryIcon
} from 'lucide-react';

import { useTheme } from "@/hooks/use-theme";



const LandingPage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
      }, []);
      

 

  const handleGetStarted = () => {
    navigate('/login');
  };

  // FEATURES ATUAIS DO SEU SISTEMA
  const currentFeatures = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Múltiplas Campanhas",
      description: "Gerencie várias campanhas simultaneamente em um só lugar",
      status: "active",
      highlight: true
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personagens & NPCs",
      description: "Fichas separadas para jogadores e NPCs com detalhes completos",
      status: "active"
    },
    {
      icon: <Swords className="w-6 h-6" />,
      title: "Controle de Iniciativa",
      description: "Sistema integrado para combates fluidos e organizados",
      status: "active",
      highlight: true
    },
    {
      icon: <Notebook className="w-6 h-6" />,
      title: "Anotações Inteligentes",
      description: "Separe por sessão, campanha ou rascunhos - tudo organizado",
      status: "active"
    },
    {
      icon: <Dice5 className="w-6 h-6" />,
      title: "Rolagem de Dados",
      description: "Sistema integrado com histórico e fórmulas personalizadas",
      status: "active"
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Mapas Interativos",
      description: "Visualize, organize e compartilhe os mapas das suas campanhas (em breve)",
      status: "coming"
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Regras Integradas",
      description: "Livros de D&D, Pathfinder e Vampiro incorporados (futuro)",
      status: "future"
    },
    {
      icon: <BestiaryIcon className="w-6 h-6" />,
      title: "Bestiário",
      description: "Controle de monstros e criaturas (planejado)",
      status: "future"
    }
  ];

  const workflowSteps = [
    {
      step: "1",
      title: "Crie sua Campanha",
      description: "Inicie uma nova campanha com configurações personalizadas"
    },
    {
      step: "2",
      title: "Adicione Jogadores",
      description: "Crie as fichas dos jogadores"
    },
    {
      step: "3",
      title: "Prepare NPCs e Encontros",
      description: "Crie NPCs detalhados e planeje encontros balanceados"
    },
    {
      step: "4",
      title: "Organize as Sessões",
      description: "Anotações separadas por sessão com tudo que precisa"
    },
    {
      step: "5",
      title: "Mestre com Confiança",
      description: "Controle de iniciativa e dados integrados durante o jogo"
    },
    {
      step: "6",
      title: "Revise e Evolua",
      description: "Acompanhe o progresso e planeje as próximas sessões"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Mestre há 5 anos",
      content: "Finalmente uma ferramenta que entende as necessidades complexas de um mestre! A iniciativa integrada salvou minhas sessões.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Mestra de D&D",
      content: "Conseguir gerenciar 3 campanhas ao mesmo tempo sem confusão mudou completamente como eu mestro.",
      rating: 5
    },
    {
      name: "Ricardo Lima",
      role: "Mestre há 10 anos",
      content: "O sistema de anotações por sessão é genial. Nunca mais perdi detalhes importantes da campanha.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header */}
      <header className={`border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-card/80' : 'bg-card/50'
      }`}>
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

          <nav className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors px-3 py-2">Recursos</a>
            <a href="#workflow" className="text-foreground/80 hover:text-foreground transition-colors px-3 py-2">Como Funciona</a>
            <a href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors px-3 py-2">Avaliações</a>
            
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

            
            <button 
              onClick={handleGetStarted} 
              className="bg-gradient-to-r from-secondary to-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium">
              Entrar
            </button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-card border border-border hover:bg-accent/10 transition-colors"
              aria-label={darkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-foreground/80" />
              )}
            </button>
            <button 
              onClick={handleGetStarted} 
              className="bg-gradient-to-r from-secondary to-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Maestrum
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-foreground/80 font-light mb-6">
                A ferramenta definitiva para <span className="font-semibold">mestres</span> de RPG
              </p>
              <p className="text-lg text-foreground/60 max-w-2xl">
                Organize <span className="font-medium text-foreground">múltiplas campanhas</span>, controle <span className="font-medium text-foreground">combates em tempo real</span>, 
                gerencie <span className="font-medium text-foreground">NPCs e anotações</span> - tudo em uma plataforma feita por mestres para mestres.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={handleGetStarted} 
                className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg flex items-center justify-center gap-2 group">
                Começar Agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#features" className="border border-border bg-card/50 px-8 py-4 rounded-lg hover:bg-card transition-colors font-medium text-lg text-center">
                Ver Recursos
              </a>
            </div>

            {/* Stats Preview */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-accent">6+</div>
                <div className="text-sm text-foreground/60">Recursos Ativos</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-secondary">∞</div>
                <div className="text-sm text-foreground/60">Campanhas</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-foreground/60">Focado no Mestre</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-green-500">✓</div>
                <div className="text-sm text-foreground/60">Pronto para Usar</div>
              </div>
            </div>
          </div>

          {/* Logo Container */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 rounded-full border-4 border-primary/20 bg-gradient-to-br from-card to-background flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center ">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-transparent">
                    <img 
                      src="/images/logo.png" 
                      alt="Maestrum Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Badges Flutuantes Atualizados */}
              <div className="absolute -top-4 -left-4 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Multi-Campanha</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium">Iniciativa</span>
                </div>
              </div>
              <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Notebook className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Anotações</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - COM STATUS */}
      <section id="features" className="border-t border-border bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recursos <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Completos</span> para Mestres
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Tudo que você precisa para organizar e mestrar campanhas profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {currentFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`
                  bg-background border rounded-2xl p-6 transition-all duration-300 relative
                  ${feature.status === 'active' ? 'border-border hover:shadow-lg hover:border-accent/30' : 
                    feature.status === 'coming' ? 'border-blue-500/30 hover:border-blue-500/50 bg-blue-500/5' : 
                    'border-foreground/20 hover:border-foreground/30 bg-foreground/5'}
                  ${feature.highlight ? 'ring-2 ring-accent/20' : ''}
                `}
              >
                {/* Status Badge */}
                <div className="absolute -top-2 -right-2">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${feature.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                      feature.status === 'coming' ? 'bg-blue-500/20 text-blue-400' : 
                      'bg-foreground/20 text-foreground/60'}
                  `}>
                    {feature.status === 'active' ? '✓ Ativo' : 
                     feature.status === 'coming' ? '🚀 Em Breve' : '📅 Planejado'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${feature.status === 'active' ? 'bg-accent/10' : 
                      feature.status === 'coming' ? 'bg-blue-500/10' : 
                      'bg-foreground/10'}
                  `}>
                    <div className={`
                      ${feature.status === 'active' ? 'text-accent' : 
                        feature.status === 'coming' ? 'text-blue-400' : 
                        'text-foreground/40'}
                    `}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-foreground/60">{feature.description}</p>
                
                {feature.highlight && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
                      ⭐ Destaque
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="border-t border-border py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Organize como um <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Profissional</span>
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Fluxo de trabalho otimizado para mestres de RPG
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-foreground/60">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector lines */}
                  {index < workflowSteps.length - 1 && (
                    <>
                      <div className="hidden lg:block absolute top-1/2 right-0 w-6 h-0.5 bg-border translate-x-full -translate-y-1/2"></div>
                      {index === 1 || index === 4 ? (
                        <div className="hidden lg:block absolute top-full left-1/2 w-0.5 h-6 bg-border -translate-x-1/2"></div>
                      ) : null}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section Atualizada */}
      <section id="testimonials" className="border-t border-border bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mestres que <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Recomendam</span>
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Veja como o Maestrum transformou a forma de mestrar RPG
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/80 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-foreground/60">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Atualizado */}
      <section className="border-t border-border py-20 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <span className="text-accent font-medium">✓ 6 Recursos Ativos</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Tudo pronto para <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">mestrar</span>
            </h2>
            <p className="text-xl text-foreground/60 mb-8">
              Comece hoje mesmo a organizar suas campanhas como um profissional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted} 
                className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg flex items-center justify-center gap-2 shadow-lg">
                <Play className="w-5 h-5" />
                Criar Conta
              </button>
              <a href="#features" className="border border-border bg-card/50 px-8 py-4 rounded-lg hover:bg-card transition-colors font-medium text-lg">
                Ver Todos Recursos
              </a>
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/images/logo.png" 
                    alt="Maestrum Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Maestrum
                </span>
              </div>
              <p className="text-foreground/60 text-sm">
                © 2025 • Feito para mestres, por mestres
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-green-500/20 hover:text-green-400 transition-all duration-300 flex items-center justify-center"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <a 
                href="https://instagram.com/maestrum" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-pink-500/20 hover:text-pink-400 transition-all duration-300 flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;