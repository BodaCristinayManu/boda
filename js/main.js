// Espera a que todo (imágenes, videos, fuentes) esté cargado
window.addEventListener('load', () => {
  // ===== GESTIÓN DE PANTALLA DE CARGA (Añadido) =====
  const loadingScreen = document.getElementById('loading-screen');
  const pageContent = document.getElementById('page-content');

  if (loadingScreen && pageContent) {
    // Oculta la pantalla de carga con un fade-out
    loadingScreen.style.opacity = '0';
    // Muestra el contenido principal con un fade-in
    pageContent.style.visibility = 'visible';
    pageContent.style.opacity = '1';

    // Después de la transición, elimina la pantalla de carga para no interferir
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 800); // Coincide con la duración de la transición de opacidad del CSS
  }
  // ========================================================

  // ====== ELEMENTOS GLOBALES ======
  const menuBtn       = document.getElementById('menu-btn');
  const menu          = document.getElementById('menu');
  const navbar        = document.getElementById('navbar');
  const navLinks      = document.querySelectorAll('a.nav-link[href^="#"]');
  const scrollContainer = document.querySelector('[data-scroll-container]');

  // ====== MENÚ RESPONSIVE ======
  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    
    // Toggle del menú con animación
    if (menu.classList.contains('hidden')) {
      // Abrir menú
      menu.classList.remove('hidden');
      menu.style.backgroundColor = '#fff7f2';
      
      // Aplicar animación después de mostrarlo
      setTimeout(() => {
        menu.classList.add('active');
      }, 10);
    } else {
      // Cerrar menú con animación
      menu.classList.remove('active');
      setTimeout(() => {
        menu.classList.add('hidden');
        menu.style.backgroundColor = '';
      }, 500); // Coincide con la duración de la transición
    }
  });

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !menu.classList.contains('hidden')) {
      // Cerrar menú con animación
      menu.classList.remove('active');
      setTimeout(() => {
        menu.classList.add('hidden');
        menu.style.backgroundColor = '';
      }, 500);
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
      const targetTime = new Date("2026-05-02T16:15:00Z").getTime();

      function update() {
        const diff = targetTime - Date.now();
        if (diff <= 0) {
          // Después (o al llegar) a la hora de la boda, fijamos a cero todos los contadores.
          daysEl.innerText    = '00';
          hoursEl.innerText   = '00';
          minutesEl.innerText = '00';
          secondsEl.innerText = '00';
          return;
        }
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
      menu.style.backgroundColor = '';
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

  // ====== BOTON CALENDARIO ======
  const addButton = document.getElementById('addToCalendarBtn');

  if (addButton) {
    addButton.addEventListener('click', () => {
      const event = {
        title: 'Boda de Cristina y Manu 💍🎉',
        description: '¡Llegó el gran día! Ven con toda tu energía, tus mejores pasos de baile y muchas ganas de celebrar el amor. 💃🕺',
        startDate: '2026-05-02',
        endDateExclusive: '2026-05-03',
        location: 'Paraisso al Mar, Guardias Viejas, Almería'
      };
      createAndDownloadICS(event);
    });
  }

  function createAndDownloadICS({ title, description, startDate, endDateExclusive, location }) {
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const formattedStart = startDate.replace(/-/g, '');
    const formattedEnd = endDateExclusive.replace(/-/g, '');

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TuWebBoda//ES',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${dtStamp}@tusitio.com`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${formattedStart}`,
      `DTEND;VALUE=DATE:${formattedEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
  
      // ===== RECORDATORIO 1 SEMANA ANTES =====
      'BEGIN:VALARM',
      'TRIGGER:-P1WT6H', // 1 semana antes
      'ACTION:DISPLAY',
      'DESCRIPTION:¡Sólo una semana para la boda de Cristina y Manu! Revisa tu lista de cosas a hacer 📋',
      'SUMMARY:Recordatorio - 1 semana antes',
      'END:VALARM',
      
      // ===== RECORDATORIO 1 DÍA ANTES =====
      'BEGIN:VALARM',
      'TRIGGER:-P1DT6H', // 1 día antes
      'ACTION:DISPLAY',
      'DESCRIPTION:¡Mañana es la gran día! 🥂',
      'SUMMARY:Recordatorio - 1 día antes',
      'END:VALARM',
      
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const blob = new Blob([icsLines.join('\r')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'boda-cristina-manu.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ====== GALERÍA HISTORIA ======
  (function historia3DCarousel() {
    const container = document.getElementById('historia-scroll');
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.historia-item'));
    const frames = items.map(it => it.querySelector('.historia-frame') || it);
    if (!items.length) return;

    // Lee la perspectiva del CSS (fallBack 1000)
    const PERSPECTIVE = (() => {
      const v = getComputedStyle(container).perspective;
      const n = parseFloat(v);
      return Number.isFinite(n) && n > 0 ? n : 1000;
    })();

    // Parámetros del efecto
    const MAX_DEPTH    = 90;   // px hacia el fondo en laterales (z negativo)
    const ROT_MAX_DEG  = 11;   // rotación Y en laterales
    const MIN_OPACITY  = 0.5;  // opacidad mínima en extremos
    const EDGE_EPS     = 0.6;  // tolerancia para “estar en el borde”
    const CENTER_SCALE = 1.25; // tamaño cuando está centrada (máximo)
    const SIDE_SCALE   = 0.90; // tamaño en los extremos
    const lerp = (a, b, t) => a + (b - a) * t;

    let centers = [];
    let bounds  = { min: 0, max: 0 };
    let rafId   = null;
    let scrollEndTimer = null;
    let isSnapping = false;
    let ready = false;
    let isDragging = false;

    const halfW = () => container.clientWidth / 2;

    function computeCenters() {
      centers = items.map(it => it.offsetLeft + it.offsetWidth / 2);
    }

    function computeBounds() {
      if (!centers.length) return;
      bounds.min = centers[0] - halfW();
      bounds.max = centers[centers.length - 1] - halfW();
    }

    function softClampDuringScroll() {
      // Sólo corrige si se sale mucho de los límites (no pelear con el dedo)
      const x = container.scrollLeft;
      if (x < bounds.min - 8) container.scrollLeft = bounds.min;
      else if (x > bounds.max + 8) container.scrollLeft = bounds.max;
    }

    function compensatedScaleForZ(z) {
      // Cancela el cambio de tamaño por perspectiva:
      // la proyección escala por P/(P - z) -> compensamos con (P - z)/P
      return (PERSPECTIVE - z) / PERSPECTIVE;
    }

    function update3D() {
      if (!ready) return;

      const centerX = container.scrollLeft + halfW();
      const maxDist = Math.max(halfW(), 1);
      const atMin = Math.abs(container.scrollLeft - bounds.min) < EDGE_EPS;
      const atMax = Math.abs(container.scrollLeft - bounds.max) < EDGE_EPS;

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        let dx = centers[i] - centerX;

        if (atMin && i === 0) dx = 0;
        if (atMax && i === frames.length - 1) dx = 0;

        const t = Math.max(-1, Math.min(1, dx / maxDist)); // -1..1
        const adx = Math.abs(t);

        const z       = -MAX_DEPTH * adx;     // 0..-MAX_DEPTH
        const rotY    = -t * ROT_MAX_DEG;     // -ROT..ROT

        // 1) Compensación de perspectiva (mantiene tamaño base constante)
        const scaleComp = compensatedScaleForZ(z);

        // 2) Énfasis: centra -> CENTER_SCALE, extremos -> SIDE_SCALE
        const emphasis  = lerp(SIDE_SCALE, CENTER_SCALE, 1 - adx);

        const scale   = scaleComp * emphasis;
        const opacity = 1 - (1 - MIN_OPACITY) * adx;

        const blur = Math.round(adx * 1.0 * 10) / 10;
        const shadowAlpha = 0.28 * (1 - adx);
        frame.style.boxShadow = `0 10px 24px rgba(0,0,0,${shadowAlpha.toFixed(2)})`;
        frame.style.filter = blur ? `blur(${blur}px)` : 'none';

        const sc = Math.round(scale * 1000) / 1000;
        frame.style.transform = `translateZ(${z}px) rotateY(${rotY}deg) scale(${sc})`;
        frame.style.opacity   = opacity.toFixed(3);
        frame.style.zIndex    = String(1000 - Math.round(adx * 1000));
      }
    }

    function onScroll() {
      if (!ready) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!isDragging) softClampDuringScroll();
        update3D();
      });
    }

    function snapToClosest() {
      if (!ready) return;

      const centerX = container.scrollLeft + halfW();
      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < centers.length; i++) {
        const d = Math.abs(centers[i] - centerX);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      }

      const target  = centers[bestIdx] - halfW();
      const clamped = Math.max(bounds.min, Math.min(bounds.max, target));
      const isEdge  = (bestIdx === 0 && Math.abs(clamped - bounds.min) < 2)
                  || (bestIdx === centers.length - 1 && Math.abs(clamped - bounds.max) < 2);

      isSnapping = true;
      container.classList.add('snapping');
      container.scrollTo({ left: clamped, behavior: isEdge ? 'auto' : 'smooth' });

      const SNAP_MS = isEdge ? 0 : 260;
      setTimeout(() => {
        isSnapping = false;
        container.classList.remove('snapping');
        if (isEdge) container.scrollLeft = clamped;
        update3D();
      }, SNAP_MS + 60);
    }

    function startDrag() {
      isDragging = true;
      if (!isSnapping) container.classList.remove('snapping'); // sin transición durante drag
    }
    function endDrag() { isDragging = false; }

    // Eventos
    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('scroll', () => {
      if (!ready) return;
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => { if (!isSnapping) snapToClosest(); }, 90);
    }, { passive: true });

    container.addEventListener('pointerdown', startDrag, { passive: true });
    container.addEventListener('touchstart',   startDrag, { passive: true });
    window.addEventListener('pointerup', endDrag, { passive: true });
    window.addEventListener('touchend', endDrag,   { passive: true });

    // Prioriza scroll horizontal dentro de la galería (evita scroll vertical “colado”)
    let sx = 0, sy = 0;
    container.addEventListener('touchstart', (e) => {
      const t = e.touches[0]; sx = t.clientX; sy = t.clientY;
    }, { passive: true });

    function initGeometry() {
      computeCenters();
      computeBounds();
    }

    // INIT robusto: calcula ya y coloca 1ª centrada; doble RAF mejora en iOS
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initGeometry();
        container.scrollLeft = bounds.min;
        ready = true;
        update3D();
      });
    });

    // Recalcula en resize/orientación y tras load (por si cambian métricas)
    window.addEventListener('resize', () => {
      initGeometry();
      container.scrollLeft = Math.max(bounds.min, Math.min(bounds.max, container.scrollLeft));
      update3D();
    });
    window.addEventListener('load', () => {
      initGeometry();
      container.scrollLeft = Math.max(bounds.min, Math.min(bounds.max, container.scrollLeft));
      update3D();
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
  (function initDresscodeCarouselMobile() {
    const carousel = document.querySelector('#dresscode .carousel');
    const dots = Array.from(document.querySelectorAll('#dresscode .dot'));

    // Accessibility y comportamiento
    carousel.tabIndex = 0;
    carousel.style.scrollBehavior = 'smooth';
    carousel.style.WebkitOverflowScrolling = 'touch'; // inercia iOS

    // Estado para gesture
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let startTime = 0;
    let isDragging = false;

    // rAF scroll update
    let rafPending = false;
    function updateOnScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        const idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
        updateDots(idx);
        rafPending = false;
      });
    }
    carousel.addEventListener('scroll', updateOnScroll, { passive: true });

    // Actualiza dots + aria-current
    function updateDots(activeIndex) {
      if (!dots.length) return;
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === activeIndex);
        d.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
      });
    }

    // Snap al slide (uso central)
    function scrollToIndex(index) {
      index = Math.max(0, Math.min(dots.length - 1, index));
      carousel.scrollTo({ left: index * carousel.clientWidth, behavior: 'smooth' });
      // refresh loco/ScrollTrigger después de la animación
      setTimeout(() => {
        try { if (window.locoScroll) window.locoScroll.update(); } catch(e){}
        try { ScrollTrigger.refresh(); } catch(e){}
      }, 320);
      updateDots(index);
    }

    // Pointer / touch handlers con cálculo de velocidad
    function onPointerDown(e) {
      isDown = true;
      isDragging = false;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startScroll = carousel.scrollLeft;
      startTime = Date.now();
      carousel.classList.add('is-dragging');
      // evito seleccionar texto mientras arrastra
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }
    function onPointerMove(e) {
      if (!isDown) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - startX;
      if (Math.abs(dx) > 4) isDragging = true;
      // invertir dx para scroll natural (arrastrar izquierda -> avanzar)
      carousel.scrollLeft = startScroll - dx;
      updateOnScroll();
    }
    function onPointerUp(e) {
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove('is-dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : (e.clientX || startX);
      const dx = endX - startX;
      const dt = Math.max(1, Date.now() - startTime); // ms
      const velocity = dx / dt; // px per ms

      const width = carousel.clientWidth;
      const currentIndexFloat = carousel.scrollLeft / width;
      const nearest = Math.round(currentIndexFloat);

      // reglas para decidir next/prev:
      // - swipe suficientemente largo (>=20% ancho) -> cambiar slide
      // - o swipe rápido (velocidad absoluta > 0.5 px/ms) -> cambiar según dirección
      const distThreshold = width * 0.18;
      const velocityThreshold = 0.5; // px/ms

      let targetIndex = nearest;
      if (Math.abs(dx) > distThreshold || Math.abs(velocity) > velocityThreshold) {
        // si dx < 0 => swipe left -> next (+1)
        const direction = dx < 0 ? 1 : -1;
        targetIndex = Math.round(startScroll / width) + direction;
      } else {
        targetIndex = nearest;
      }

      // clamp y scrollTo
      const numSlides = dots.length;
      targetIndex = (targetIndex + numSlides) % numSlides;
      scrollToIndex(targetIndex);
    }

    // Listeners (pointer y touch)
    carousel.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    // fallback touch events (por si)
    carousel.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Dots: área táctil mayor y accesibilidad
    dots.forEach((dot, i) => {
      // incrementar area táctil si no tienes CSS ya
      dot.style.touchAction = 'manipulation';
      dot.style.padding = '6px'; // aumenta hit area sin romper diseño
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Ir a inspiración ${i + 1}`);
      dot.tabIndex = 0;
      dot.addEventListener('click', (ev) => {
        ev.preventDefault();
        scrollToIndex(i);
      });
      dot.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') dot.click();
      });
    });

    // Teclado (útil en tablets con teclado)
    carousel.addEventListener('keydown', (ev) => {
      const idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
      if (ev.key === 'ArrowRight') scrollToIndex(Math.min(dots.length - 1, idx + 1));
      if (ev.key === 'ArrowLeft')  scrollToIndex(Math.max(0, idx - 1));
    });

    // Resize: recalcula posición
    window.addEventListener('resize', () => {
      const idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
      carousel.scrollLeft = idx * carousel.clientWidth;
      updateDots(idx);
      try { if (window.locoScroll) window.locoScroll.update(); } catch(e){}
    });

    // Posición inicial (texto)
    updateDots(0);
    carousel.scrollLeft = 0;
    try { if (window.locoScroll) window.locoScroll.update(); } catch(e){}
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
