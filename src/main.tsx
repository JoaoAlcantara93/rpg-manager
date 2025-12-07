import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Registrar Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nova versão disponível!');
                
                // Notificar usuário
                if (window.confirm('Nova versão disponível! Recarregar para atualizar?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });
  });
}

// Detectar se está instalado como PWA
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
if (isStandalone) {
  console.log('📱 App instalado como PWA');
}

// Evento de instalação
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  
  // Armazena o evento para mostrar botão de instalação depois
  // @ts-ignore
  window.deferredPrompt = e;
  
  console.log('📋 PWA pode ser instalada');
  
  // Mostrar botão de instalação
  const installButton = document.createElement('button');
  installButton.textContent = 'Instalar App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: #1a202c;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-weight: bold;
  `;
  
  installButton.onclick = async () => {
    // @ts-ignore
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuário aceitou instalar');
      installButton.remove();
    }
    
    // @ts-ignore
    window.deferredPrompt = null;
  };
  
  // Mostrar apenas se não estiver já instalado
  if (!isStandalone) {
    document.body.appendChild(installButton);
    
    // Remover após 30 segundos
    setTimeout(() => {
      if (document.body.contains(installButton)) {
        installButton.remove();
      }
    }, 30000);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);