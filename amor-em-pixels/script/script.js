 const paragraphs = document.querySelectorAll("#text-container p");
    let currentIndex = 0;

    function showParagraph(index) {
      paragraphs.forEach((p, i) => {
        if (i === index) {
          p.classList.add("show");
        } else {
          p.classList.remove("show");
        }
      });
    }

    function cycleParagraphs() {
      if (currentIndex < paragraphs.length) {
        showParagraph(currentIndex);
        currentIndex++;
        setTimeout(cycleParagraphs, 2500);
      } else {
        paragraphs.forEach(p => p.classList.remove("show"));
      }
    }

    const heartCanvas = document.getElementById("heartCanvas");
    const heartCtx = heartCanvas.getContext("2d");
    let particles = [];
    let mouse = { x: null, y: null, radius: 100 };
    let interactionEnabled = false;

    function resizeHeartCanvas() {
      heartCanvas.width = window.innerWidth;
      heartCanvas.height = window.innerHeight;
      generateParticles();
    }

    window.addEventListener("resize", resizeHeartCanvas);
    resizeHeartCanvas();

    function heartFunction(t, scale) {
      const x = scale * 16 * Math.pow(Math.sin(t), 3);
      const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return { x, y };
    }

    function generateParticles() {
      particles = [];
      const numParticles = 800;
      const scale = 12;
      const centerX = heartCanvas.width / 2;
      const centerY = heartCanvas.height / 2;

      for (let i = 0; i < numParticles; i++) {
        const t = Math.random() * Math.PI * 2;
        const { x, y } = heartFunction(t, scale);

        particles.push({
          x: Math.random() * heartCanvas.width,
          y: Math.random() * heartCanvas.height,
          destX: centerX + x,
          destY: centerY + y,
          radius: 1.5 + Math.random(),
          speed: 0.01 + Math.random() * 0.03,
          // Propriedades para flutuação
          floatVx: (Math.random() - 0.5) * 0.5,
          floatVy: (Math.random() - 0.5) * 0.5,
          floatTime: Math.random() * Math.PI * 2,
          // Propriedades para interação
          baseRadius: 1.5 + Math.random(),
          friction: 0.95,
          velocityX: 0,
          velocityY: 0
        });
      }
    }

    let animationProgress = 0;
    const animationDuration = 300;
    let explodePhase = false;
    let particlesAlpha = 1;
    let heartAnimationId;
    let animationStarted = false;
    let floatingMode = true;

    // Função para calcular a distância entre dois pontos
    function getDistance(x1, y1, x2, y2) {
      const dx = x1 - x2;
      const dy = y1 - y2;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // Evento de movimento do mouse para interação com partículas
    heartCanvas.addEventListener('mousemove', function(event) {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    // Remover coordenadas do mouse quando sair do canvas
    heartCanvas.addEventListener('mouseout', function() {
      mouse.x = null;
      mouse.y = null;
    });

    function animateHeart() {
      heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

      if (floatingMode) {
        // Modo flutuação - partículas se movem suavemente
        for (let p of particles) {
          p.floatTime += 0.02;
          
          // Movimento de flutuação base
          p.x += Math.sin(p.floatTime) * 0.3 + p.floatVx;
          p.y += Math.cos(p.floatTime * 0.8) * 0.2 + p.floatVy;

          if (interactionEnabled && mouse.x !== null && mouse.y !== null) {
  const distance = getDistance(p.x, p.y, mouse.x, mouse.y);

  if (distance < mouse.radius) {
    const force = (mouse.radius - distance) / mouse.radius;
    const directionX = p.x - mouse.x;
    const directionY = p.y - mouse.y;

    // Suavizar a força 
    p.velocityX += directionX * force * 0.03;
    p.velocityY += directionY * force * 0.03;
  }
}

          
          // Aplicar velocidade e fricção
          p.x += p.velocityX;
          p.y += p.velocityY;
          p.velocityX *= p.friction;
          p.velocityY *= p.friction;

          // Manter partículas dentro da tela
          if (p.x < 0) {
            p.x = 0;
            p.floatVx *= -1;
            p.velocityX *= -0.5;
          } else if (p.x > heartCanvas.width) {
            p.x = heartCanvas.width;
            p.floatVx *= -1;
            p.velocityX *= -0.5;
          }
          
          if (p.y < 0) {
            p.y = 0;
            p.floatVy *= -1;
            p.velocityY *= -0.5;
          } else if (p.y > heartCanvas.height) {
            p.y = heartCanvas.height;
            p.floatVy *= -1;
            p.velocityY *= -0.5;
          }

          heartCtx.beginPath();
          heartCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          heartCtx.fillStyle = "red";
          heartCtx.fill();
        }
      } else if (!explodePhase) {
        // Modo formação do coração
        if (animationProgress < 1) {
          animationProgress += 1 / animationDuration;
          if (animationProgress > 1) animationProgress = 1;
        }

        for (let p of particles) {
          const dx = p.destX - p.x;
          const dy = p.destY - p.y;
          const currentSpeed = p.speed * animationProgress;

          p.x += dx * currentSpeed;
          p.y += dy * currentSpeed;

          heartCtx.beginPath();
          heartCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          heartCtx.fillStyle = "red";
          heartCtx.fill();
        }
      } else {
        // Modo explosão
        let particlesVisible = 0;

        for (let p of particles) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x >= 0 && p.x <= heartCanvas.width && p.y >= 0 && p.y <= heartCanvas.height) {
            heartCtx.beginPath();
            heartCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            heartCtx.fillStyle = 'rgba(255, 0, 0, 1)';
            heartCtx.fill();
            particlesVisible++;
          }
        }

        if (particlesVisible === 0) {
          cancelAnimationFrame(heartAnimationId);
          heartCanvas.style.display = 'none';
          document.getElementById('teamoCanvas').style.display = 'block';
          document.getElementById('text-container').style.display = 'none';
          startRainLove();
          return;
        }
      }

      heartAnimationId = requestAnimationFrame(animateHeart);
    }

    // Classe para criar explosões na tela de rain love
    class Explosion {
      constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.particles = [];
        this.particleCount = 15 + Math.floor(Math.random() * 10); // Número moderado de partículas
        this.color = '#FF1493'; // Rosa choque
        this.lifespan = 60; // Duração da explosão em frames
        this.currentFrame = 0;
        this.createParticles();
      }

      createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 2;
          const size = 1 + Math.random() * 2;
          const life = 30 + Math.random() * 30;
          
          this.particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            alpha: 1,
            life: life,
            maxLife: life
          });
        }
      }

      update() {
        this.currentFrame++;
        
        if (this.currentFrame >= this.lifespan) {
          return false; // Explosão terminou
        }

        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          p.alpha = p.life / p.maxLife;
          
          if (p.life <= 0) {
            this.particles.splice(i, 1);
            i--;
            continue;
          }
          
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(255, 20, 147, ${p.alpha})`;
          this.ctx.fill();
        }
        
        return true; // Explosão ainda ativa
      }
    }

    function startRainLove() {
      const canvas = document.getElementById('teamoCanvas');
      const ctx = canvas.getContext('2d');

      const phrase = "TeAmo";
      const fontSize = 18;
      let columns;
      let drops;
      let explosions = [];

      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.font = fontSize + 'px Arial';
        const colWidth = fontSize;
        columns = Math.floor(canvas.width / colWidth);
        drops = new Array(columns).fill(0);
      }

      resizeCanvas();
      const heartColor = '#F52420';

      // Adicionar evento de clique para criar explosões
      canvas.addEventListener('click', function(event) {
        explosions.push(new Explosion(event.clientX, event.clientY, ctx));
      });

      function drawLove() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Atualizar e desenhar explosões
        for (let i = 0; i < explosions.length; i++) {
          const isActive = explosions[i].update();
          if (!isActive) {
            explosions.splice(i, 1);
            i--;
          }
        }

        ctx.fillStyle = heartColor;
        ctx.font = fontSize + 'px monospace';

        const colWidth = ctx.measureText(phrase).width;

        for (let i = 0; i < columns; i++) {
          const x = i * colWidth;
          const y = drops[i] * fontSize;

          ctx.fillText(phrase, x, y);
          drops[i]++;

          if (y > canvas.height && Math.random() > 0.960) {
            drops[i] = 0;
          }
        }
      }

      setInterval(drawLove, 65);
      window.addEventListener('resize', resizeCanvas);
    }

    // Iniciar animação de flutuação imediatamente
    animateHeart();

    document.getElementById('startButton').addEventListener('click', () => {
      if (animationStarted) return;
      animationStarted = true;

     // Iniciar música imediatamente
document.getElementById('myAudio').play();

// Mostrar mensagens "Apague a Luz" e "Aumente o Volume" com delay de 2 segundos
  setTimeout(() => {
    showCentralMessages();
  }, 2000);

      // Fazer o botão desaparecer imediatamente (fade rápido)
      const button = document.getElementById('startButton');
      button.classList.add('fade-out');
      setTimeout(() => {
        button.style.display = 'none';
      }, 800);

      // Habilitar interação com as partículas
      interactionEnabled = true;

      // Manter modo flutuação por 14 segundos antes de iniciar formação do coração
      setTimeout(() => {
        // Parar flutuação e começar formação do coração
        floatingMode = false;
        interactionEnabled = false; // Desabilitar interação durante a formação do coração
        animationProgress = 0;
        
        setTimeout(() => {
          cycleParagraphs();
        }, 4500);

        // Após 9 segundos da formação do coração, iniciar explosão (14 + 9 = 23 segundos após o clique)
        setTimeout(() => {
          explodePhase = true;
          for (let p of particles) {
            const angle = Math.random() * 2 * Math.PI;
            const speed = 2 + Math.random() * 3;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
          }
        }, 13000);

      }, 13000);
    });

   function showCentralMessages() {
  const centralMessage = document.getElementById("central-message");
  const msgs = centralMessage.querySelectorAll("p");
  let idx = 0;
  centralMessage.style.display = "block";

  function showNext() {
    if (idx < msgs.length) {
      msgs[idx].classList.add("show");
      setTimeout(() => {
        msgs[idx].classList.remove("show");
        idx++;
        setTimeout(showNext, 2000); // 2s entre apagar e mostrar próximo
      }, 2000); // 2s visível
    } else {
      // Quando terminar, oculta o central-message suavemente
      setTimeout(() => {
        centralMessage.style.display = "none";
      }, 1500);
    }
  }

  // Aparecer o primeiro texto só 2 segundos após o botão ser clicado
  setTimeout(showNext, 1500);
}