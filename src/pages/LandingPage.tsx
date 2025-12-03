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
  Moon
} from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Gerenciar scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Verificar tema salvo no carregamento
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const root = document.documentElement;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      const root = document.documentElement;
      
      if (newValue) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newValue;
    });
  };

  // Função para navegar para a página de login
  const handleGetStarted = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personagens",
      description: "Gerencie fichas de jogadores e NPCs"
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Mapas",
      description: "Crie e compartilhe mapas interativos"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Histórias",
      description: "Organize enredos e missões"
    },
    {
      icon: <Dice5 className="w-6 h-6" />,
      title: "Dados",
      description: "Sistema de rolagem integrado"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Mestre há 5 anos",
      content: "Finalmente uma ferramenta que entende as necessidades de um mestre de RPG!",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Jogadora",
      content: "A experiência ficou muito mais imersiva com a organização do Maestrum.",
      rating: 5
    },
    {
      name: "Ricardo Lima",
      role: "Mestre há 10 anos",
      content: "Revolucionou minhas campanhas. Não consigo mais jogar sem!",
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

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors px-3 py-2">Recursos</a>
            <a href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors px-3 py-2">Avaliações</a>
            
            {/* Botão de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-card border border-border hover:bg-accent/10 transition-colors flex items-center justify-center"
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

          {/* Mobile - Botão Tema e Entrar */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-card border border-border hover:bg-accent/10 transition-colors flex items-center justify-center"
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

      {/* Hero Section - Layout Específico */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content - Lado Esquerdo */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Maestrum
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-foreground/80 font-light mb-6">
                Seu companheiro definitivo para campanhas de RPG
              </p>
              <p className="text-lg text-foreground/60 max-w-2xl">
                Organize personagens, histórias, mapas e encontros em uma plataforma 
                intuitiva feita por mestres para mestres.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={handleGetStarted} 
                className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg flex items-center justify-center gap-2 group">
                Começar Agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-border bg-card/50 px-8 py-4 rounded-lg hover:bg-card transition-colors font-medium text-lg">
                Ver Demonstração
              </button>
            </div>

            {/* Mini Features */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
              {features.map((feature, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
                    <div className="text-accent">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-foreground/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logo Container - Lado Direito */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Círculo Principal com Logo */}
              <div className="w-80 h-80 rounded-full border-4 border-primary/20 bg-gradient-to-br from-card to-background flex items-center justify-center shadow-2xl relative overflow-hidden">
                {/* Logo Central - Imagem ocupando todo o círculo */}
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-transparent">
                    <img 
                      src="/images/logo.png" 
                      alt="Maestrum Logo" 
                      className="w-full h-full object-contain scale-110"
                    />
                  </div>
                </div>

                {/* Elementos Decorativos no Círculo */}
                <div className="absolute top-8 left-8 w-6 h-6 rounded-full bg-secondary/20 animate-pulse"></div>
                <div className="absolute bottom-8 right-8 w-4 h-4 rounded-full bg-accent/30 animate-pulse delay-1000"></div>
                <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-primary/40 animate-pulse delay-500"></div>
                <div className="absolute bottom-12 left-12 w-5 h-5 rounded-full bg-secondary/25 animate-pulse delay-1500"></div>
              </div>

              {/* Badges Flutuantes */}
              <div className="absolute -top-4 -left-4 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Rápido</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium">Seguro</span>
                </div>
              </div>
              <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-card border border-border rounded-2xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Intuitivo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (se você quiser adicionar) */}
      <section id="features" className="border-t border-border bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recursos <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Poderosos</span>
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Tudo que você precisa para mestrar suas campanhas de RPG
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow hover:border-accent/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <div className="text-accent">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="border-t border-border bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que os <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Mestres</span> dizem
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Junte-se a centenas de mestres que já transformaram suas campanhas
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

      {/* Final CTA */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para começar sua <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">aventura</span>?
            </h2>
            <p className="text-xl text-foreground/60 mb-8">
              Junte-se a milhares de mestres e transforme sua forma de jogar RPG
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted} 
                className="bg-gradient-to-r from-secondary to-accent text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Criar Conta 
              </button>
              <button className="border border-border bg-card/50 px-8 py-4 rounded-lg hover:bg-card transition-colors font-medium text-lg">
                Saber Mais
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-foreground/60">
                © 2025 Maestrum. Todos os direitos reservados.
              </p>
            </div>

            {/* Redes Sociais - WhatsApp e Instagram */}
            <div className="flex items-center gap-4">
              {/* WhatsApp */}
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-green-500/20 hover:text-green-400 transition-all duration-300 flex items-center justify-center group"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/maestrum" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-pink-500/20 hover:text-pink-400 transition-all duration-300 flex items-center justify-center group"
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