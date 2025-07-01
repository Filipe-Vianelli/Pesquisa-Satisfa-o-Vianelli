const scriptURL = "https://script.google.com/macros/s/AKfycbwJMQB8_epVPrRGpw7RlJX_oybmwXlkrVTWYLJ-0Yom87FkpJLeRsgnCB1C9Iqn-ZG9/exec";
let selectedSector = '';
let votingBlocked = false;

function showScreen(screenId) {
  const loadingOverlay = document.querySelector('.loading-overlay');
  const backButton = document.querySelector('.back-button');

  // Exibe o overlay de carregamento
  loadingOverlay.classList.add('active');

  // Aguarda 2 segundos antes de trocar a tela
  setTimeout(() => {
    // Oculta todas as telas
    document.querySelectorAll('.sector-screen, .voting-screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Mostra a tela alvo
    document.getElementById(screenId).classList.add('active');

    // Controla a visibilidade do botão Voltar
    if (backButton) {
      if (screenId === 'votingScreen') {
        backButton.style.display = 'inline-block';
      } else {
        backButton.style.display = 'none';
      }
    }

    // Oculta o overlay de carregamento
    loadingOverlay.classList.remove('active');
  }, 2000);
}

function selectSector(sector) {
  selectedSector = sector;
  showScreen('votingScreen');
}

function createParticles(button, emoji) {
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Define a classe da partícula de acordo com o emoji
  let particleClass = 'neutral';
  if (emoji === '😄' || emoji === '🙂') particleClass = 'happy';
  else if (emoji === '😐') particleClass = 'neutral';
  else if (emoji === '😟' || emoji === '😞') particleClass = 'sad';

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = `particle ${particleClass}`;

    // Tamanho aleatório
    const size = 8 + Math.random() * 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Posição em círculo ao redor do emoji
    const angle = (i / 12) * Math.PI * 2;
    const radius = 20;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    // Duração e atraso da animação aleatórios
    const duration = 0.8 + Math.random() * 0.8;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${Math.random() * 0.2}s`;

    // Rotação inicial aleatória
    const rotation = Math.random() * 360;
    particle.style.transform = `rotate(${rotation}deg)`;

    document.body.appendChild(particle);

    // Remove partícula após a animação
    setTimeout(() => particle.remove(), duration * 1000 + 200);
  }
}

function enviarVoto(emoji, button) {
  // Feedback visual de clique
  button.style.transform = 'scale(0.95)';
  setTimeout(() => button.style.transform = '', 150);

  if (votingBlocked) {
    console.log('Votação bloqueada - aguarde');
    return;
  }

  console.log('Função enviarVoto chamada com:', emoji);
  votingBlocked = true;

  desabilitarBotoes();
  console.log('Botões desabilitados');

  createParticles(button, emoji);

  const dados = {
    emoji: emoji,
    setor: selectedSector,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  console.log('Enviando dados:', dados);

  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  })
  .then(() => {
    console.log('Fetch executado com sucesso');
    setTimeout(() => {
      document.getElementById("mensagem").classList.add('show');
      console.log('Mensagem exibida');

      setTimeout(() => {
        document.getElementById("mensagem").classList.remove('show');
        console.log('Mensagem removida');
        showScreen('sectorScreen');
        votingBlocked = false;
        habilitarBotoes();
      }, 30000); // 30 segundos
    }, 500);
  })
  .catch(err => {
    console.error('Erro no fetch:', err);
    alert("Erro ao registrar o voto. Tente novamente.");
    votingBlocked = false;
    habilitarBotoes();
  });
}

function desabilitarBotoes() {
  document.querySelectorAll('.emoji-button').forEach(btn => {
    btn.style.opacity = '0.4';
    btn.style.cursor = 'not-allowed';
    btn.style.pointerEvents = 'none';
  });
}

function habilitarBotoes() {
  document.querySelectorAll('.emoji-button').forEach(btn => {
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.style.pointerEvents = 'auto';
  });
}

window.addEventListener('load', () => {
  document.querySelector('.container').style.animation = 'slideIn 0.8s ease-out';
});
