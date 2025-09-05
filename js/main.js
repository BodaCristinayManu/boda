// Espera a que todo (imágenes, videos, fuentes) esté cargado
window.addEventListener('load', () => {
  // ====== ELEMENTOS GLOBALES ======
  const menuBtn       = document.getElementById('menu-btn');
  const menu          = document.getElementById('menu');
  const navbar        = document.getElementById('navbar');
  const navLinks      = document.querySelectorAll('a.nav-link[href^="#"]');
  const scrollContainer = document.querySelector('[data-scroll-container]');

  // ====== MENÚ RESPONSIVE ======
  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
    }
  });

  // ====== NAVBAR SCROLLED ======
  const onScrollNav = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScrollNav);
  onScrollNav();

  // ====== COUNTDOWN ======
  (function initCountdown() {
    const daysEl    = document.getElementById('days');
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const targetTime = new Date("2026-05-02T18:00:00").getTime();

    function update() {
      const diff = targetTime - Date.now();
      const d = Math.max(0, Math.floor(diff / 86400000));
      const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
      const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
      const s = Math.max(0, Math.floor((diff % 60000) / 1000));
      daysEl.innerText    = d;
      hoursEl.innerText   = h;
      minutesEl.innerText = m;
      secondsEl.innerText = s;
    }
    update();
    setInterval(update, 1000);
  })();

  // ====== LOCOMOTIVE + GSAP SCROLLTRIGGER ======
  gsap.registerPlugin(ScrollTrigger);

  const locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    smartphone: { smooth: false, lerp: 0.5 },
    tablet:     { smooth: false }
  });
  locoScroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      if (arguments.length) {
        locoScroll.options.smooth
          ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
          : scrollContainer.scrollTop = value;
      } else {
        return locoScroll.options.smooth
          ? locoScroll.scroll.instance.scroll.y
          : scrollContainer.scrollTop;
      }
    },
    getBoundingClientRect() {
      return { top:0, left:0, width:window.innerWidth, height:window.innerHeight };
    },
    pinType: scrollContainer.style.transform ? 'transform' : 'fixed'
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.refresh();

  // ====== SMOOTH SCROLL ENLACES NAVBAR ======
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      menu.classList.add('hidden');
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      locoScroll.scrollTo(target, {
        offset: -80,
        duration: 1,
        callback() {
          history.pushState(null, null, link.hash);
          locoScroll.update();
          ScrollTrigger.refresh();
          setTimeout(() => {
            locoScroll.update();
            ScrollTrigger.refresh(true);
          }, 300);
        }
      });
    });
  });

  // ====== ANIMACIONES SECCIONES ======
  // Para que tuvieran el efecto de aparecer -> No es prioritario
  // const sections = gsap.utils
  //   .toArray('header, section')
  //   .filter(sec => !sec.matches('#horario, #dresscode, #rsvp'));

  // sections.forEach(sec => {
  //   gsap.from(sec, {
  //     scrollTrigger: {
  //       trigger: sec,
  //       scroller: scrollContainer,
  //       start: 'top 80%',
  //       toggleActions: 'play none none none',
  //       once: true
  //     },
  //     opacity: 0,
  //     y: 50,
  //     duration: 1,
  //     ease: 'power2.out',
  //     delay: 0.2
  //   });
  // });

  // ====== GALERÍA INTERACTIVA ======
  (function initGallery() {
    const container = document.getElementById('historia-scroll');
    if (!container) return;
    const items = container.querySelectorAll('.historia-item');
    if (!items.length) return;

    const halfW = () => container.clientWidth / 2;
    const minScroll = () => items[0].offsetLeft + items[0].offsetWidth / 2 - halfW();
    const maxScroll = () => {
      const last = items[items.length - 1];
      return last.offsetLeft + last.offsetWidth / 2 - halfW();
    };

    function updateScales() {
      const centerX = container.getBoundingClientRect().left + halfW();
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(centerX - itemCenter);
        const ratio = Math.min(dist / (container.clientWidth / 2), 1);
        const scale = 1 + (1 - ratio) * 0.4;
        const opacity = 0.5 + (1 - ratio) * 0.5;
        item.style.transform = `scale(${scale})`;
        item.style.opacity   = opacity;
        item.style.zIndex    = Math.round((1 - ratio) * 100);
      });
    }

    function clampScroll() {
      const min = minScroll();
      const max = maxScroll();
      if (container.scrollLeft < min) container.scrollLeft = min;
      if (container.scrollLeft > max) container.scrollLeft = max;
    }

    // Eventos
    container.addEventListener('scroll', () => {
      updateScales();
      clampScroll();
    });
    window.addEventListener('resize', () => {
      clampScroll();
      updateScales();
    });

    // Inicializar escalas antes de centrar
    updateScales();

    // ====== CENTRAR PRIMER ÍTEM TRAS PRIMER PINTADO ======
    requestAnimationFrame(() => {
      container.scrollLeft = minScroll();
      updateScales();
    });
  })();

  // ====== HORARIO ======
  (function initHorarioClick() {
    const horario = document.getElementById('horario');
    if (!horario) return;

    // Calcula el offset para que la sección quede centrada verticalmente
    const calcOffset = () => {
      const vh = window.innerHeight;
      const sh = horario.offsetHeight;
      return -(vh / 2 - sh / 2);
    };

    // Asocia el click solo al enlace de '#horario'
    document
      .querySelectorAll('a.nav-link[href="#horario"]')
      .forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();

          // Cierra el menú si está abierto
          menu.classList.add('hidden');

          // Scroll suave con Locomotive
          locoScroll.scrollTo(horario, {
            offset:  calcOffset(),
            duration: 1,                // en segundos
            easing:   [0.25, 0.0, 0.35, 1]
          });

          // Actualiza la URL sin salto de página
          history.pushState(null, '', '#horario');
        });
      });
  })();

  // ====== DRESSCODE ======
  (function initDresscode() {
    const btn          = document.getElementById('showInspirationBtn');
    const modal        = document.getElementById('inspirationModal');
    const modalContent = modal.querySelector('.modal-content');

    if (!btn || !modal || !modalContent) return;

    btn.addEventListener('click', () => {
      modal.classList.add('open');
    });

    modal.addEventListener('click', (e) => {
      if (!modalContent.contains(e.target)) {
        modal.classList.remove('open');
      }
    });
  })();

  // ====== AUTOPLAY ROBUSTO (sin botón) ======
  (function robustAutoPlay() {
    const videos = Array.from(document.querySelectorAll('video'));

    if (!videos.length) return;

    videos.forEach(video => {
      // Asegurar atributos mínimos
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = video.preload || 'auto';

      // Si hay overlays dentro del contenedor cercano, permitimos pasar los eventos al vídeo
      try {
        const container = video.parentElement;
        if (container) {
          // Buscar elementos absolutamente posicionados que puedan tapar el vídeo
          Array.from(container.querySelectorAll('*')).forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'absolute' || style.position === 'fixed') {
              // Sólo quitar pointer-events si el elemento no contiene controles interactivos
              if (!el.matches('a,button,input,textarea,select')) {
                el.style.pointerEvents = 'none';
              }
            }
          });
        }
      } catch (e) {
        // no fatal
        console.warn('No se pudo ajustar overlays:', e);
      }

      // Intentos con backoff
      video._playAttempts = 0;
      function tryPlay() {
        video._playAttempts = (video._playAttempts || 0) + 1;
        // aseguramos que está muteado antes de intentar
        video.muted = true;
        const promise = video.play();
        if (promise !== undefined) {
          promise.then(() => {
            // éxito: nada más que hacer
            // console.log('Vídeo reproduciéndose:', video);
          }).catch((err) => {
            // Si la reproducción falla, reintentamos con backoff, hasta N intentos
            const MAX_ATTEMPTS = 8;
            if (video._playAttempts >= MAX_ATTEMPTS) {
              // damos por perdido hasta la interacción del usuario
              // console.warn('Máximos intentos de reproducción alcanzados', video);
              return;
            }
            const delay = Math.min(500 * Math.pow(2, video._playAttempts - 1), 8000); // 500ms,1s,2s,4s... cap 8s
            setTimeout(() => tryPlay(), delay);
          });
        }
      }

      // Reintentar cuando haya eventos de carga que indican que se puede reproducir
      ['canplay', 'canplaythrough', 'loadeddata', 'loadedmetadata'].forEach(ev => {
        video.addEventListener(ev, () => {
          tryPlay();
        }, { once: true });
      });

      // Intento inicial (puede fallar si no hay datos aún)
      tryPlay();

      // Reintento en la PRIMERA interacción del usuario (gesture) si sigue bloqueado
      function onFirstUserGesture() {
        tryPlay();
        window.removeEventListener('pointerdown', onFirstUserGesture);
        window.removeEventListener('touchstart', onFirstUserGesture);
        window.removeEventListener('keydown', onFirstUserGesture);
      }
      window.addEventListener('pointerdown', onFirstUserGesture, { once: true });
      window.addEventListener('touchstart', onFirstUserGesture, { once: true });
      window.addEventListener('keydown', onFirstUserGesture, { once: true });

      // Opcional: cuando el vídeo suene 'pause' o 'stalled', reintentamos suavemente
      video.addEventListener('stalled', () => {
        setTimeout(() => tryPlay(), 1000);
      });
      video.addEventListener('pause', () => {
        // intentamos reanudar si no fue pausado por el usuario
        setTimeout(() => {
          if (!video.paused) return;
          tryPlay();
        }, 500);
      });
    });
  })();

  // ====== REFRESCO FINAL ======
  setTimeout(() => {
    locoScroll.update();
    ScrollTrigger.refresh(true);
  }, 500);
});

// Asegura refresco de locoscroll al redimensionar
window.addEventListener('resize', () => {
  if (window.locoScroll) {
    window.locoScroll.update();
    ScrollTrigger.refresh();
  }
});
