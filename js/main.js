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

  // ====== HORIZONTAL COUNTDOWN (inserta esto DENTRO del load(), justo después del COUNTDOWN vertical) ======
  (function initFlipCountdown() {
    const targetTime = new Date(2026, 4, 2, 18, 0, 0).getTime(); // 2 mayo 2026 18:00
    const pad2 = n => String(n).padStart(2, '0');

    // Inicializa .digit con estructura fiable
    document.querySelectorAll(".digit").forEach(digit => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="face top" data-value="0"><span class="num">0</span></div>
        <div class="face bottom" data-value="0"><span class="num">0</span></div>
      `;
      digit.appendChild(card);
      digit.dataset.value = "0";
    });

    function calcRemaining(now = Date.now()) {
      const diff = Math.max(0, targetTime - now);
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return { days, hours, minutes, seconds };
    }

    // update visual sin animación (usa para primer render o cuando no cambie)
    function setFaceValues(digitEl, val) {
      const card = digitEl.querySelector('.card');
      const top = card.querySelector('.face.top');
      const bottom = card.querySelector('.face.bottom');
      top.setAttribute('data-value', val);
      bottom.setAttribute('data-value', val);
      top.querySelector('.num').textContent = val;
      bottom.querySelector('.num').textContent = val;
      digitEl.dataset.value = val;
    }

    function animateFlip(digitEl, newVal) {
      if (!digitEl) return;
      const currentVal = digitEl.dataset.value;
      if (currentVal === newVal) return;

      // Si ya está animando este dígito, ignoramos para evitar solapamientos
      if (digitEl.dataset.animating === "1") return;
      digitEl.dataset.animating = "1";

      const card = digitEl.querySelector('.card');
      const topFace = card.querySelector('.face.top');
      const bottomFace = card.querySelector('.face.bottom');

      // 1) aseguramos que ambas caras muestren el valor actual al empezar
      topFace.querySelector('.num').textContent = currentVal;
      bottomFace.querySelector('.num').textContent = currentVal;

      // 2) crear overlayTop que muestra el valor ACTUAL y se pliega (fold)
      const overlayTop = document.createElement('div');
      overlayTop.className = 'flip-top';
      overlayTop.innerHTML = `<span class="num">${currentVal}</span>`;
      // garantizar cobertura completa y que esté por encima
      overlayTop.style.zIndex = 1000;
      digitEl.appendChild(overlayTop);

      // forzamos reflow antes de animar
      void overlayTop.offsetWidth;
      overlayTop.classList.add('animate');

      // cuando termina el plegado de overlayTop:
      overlayTop.addEventListener('animationend', () => {
        // quitar overlayTop (ya no necesitamos)
        overlayTop.remove();

        // 3) AHORA actualizamos la cara superior al nuevo valor (nuevo "top" ya visible)
        topFace.querySelector('.num').textContent = newVal;

        // 4) Creamos overlayBottom que se desplegará (unfold) mostrando la mitad inferior del nuevo valor
        const overlayBottom = document.createElement('div');
        overlayBottom.className = 'flip-bottom';
        overlayBottom.innerHTML = `<span class="num">${newVal}</span>`;
        overlayBottom.style.zIndex = 1000;
        digitEl.appendChild(overlayBottom);

        // forzar reflow y arrancar unfold
        void overlayBottom.offsetWidth;
        overlayBottom.classList.add('animate');

        // cuando termina la animación unfold:
        overlayBottom.addEventListener('animationend', () => {
          // limpiar overlayBottom
          overlayBottom.remove();
          // 5) actualizar la cara inferior con el nuevo valor (ya visible)
          bottomFace.querySelector('.num').textContent = newVal;
          digitEl.dataset.value = newVal;
          // desbloquear animación para este dígito
          digitEl.dataset.animating = "0";
        }, { once: true });

      }, { once: true });
    }

    // wrapper que decide animar o simplemente actualizar (por primera vez usamos setFaceValues)
    function updateDigit(digitEl, newVal, first = false) {
      if (first) {
        setFaceValues(digitEl, newVal);
        return;
      }
      // preferimos animación si el navegador admite motion
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        setFaceValues(digitEl, newVal);
      } else {
        animateFlip(digitEl, newVal);
      }
    }

    function renderParts(obj, first = false) {
      const d = String(obj.days).padStart(3, '0'); // tres cifras
      const h = pad2(obj.hours);
      const m = pad2(obj.minutes);
      const s = pad2(obj.seconds);

      updateDigit(document.getElementById("days_h_hundreds"), d[0], first);
      updateDigit(document.getElementById("days_h_tens"),     d[1], first);
      updateDigit(document.getElementById("days_h_units"),    d[2], first);

      updateDigit(document.getElementById("hours_h_tens"),    h[0], first);
      updateDigit(document.getElementById("hours_h_units"),   h[1], first);

      updateDigit(document.getElementById("minutes_h_tens"),  m[0], first);
      updateDigit(document.getElementById("minutes_h_units"), m[1], first);

      updateDigit(document.getElementById("seconds_h_tens"),  s[0], first);
      updateDigit(document.getElementById("seconds_h_units"), s[1], first);
    }

    // primer render (sin animaciones)
    renderParts(calcRemaining(), true);

    // luego, tick cada segundo (animando según sea necesario)
    setInterval(() => {
      renderParts(calcRemaining(), false);
    }, 1000);

    // sync on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) renderParts(calcRemaining(), false);
    });
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
  (function initDresscodeCarouselMobile() {
    const carousel = document.querySelector('#dresscode .carousel');
    const dots = Array.from(document.querySelectorAll('#dresscode .dot'));
    const btn = document.getElementById('showInspirationBtn'); // fallback si no has cambiado HTML
    const modal = document.getElementById('inspirationModal'); // fallback

    // Fallback al modal si aún no existe el carrusel
    if (!carousel) {
      if (!btn || !modal) return;
      const modalContent = modal.querySelector('.modal-content');
      btn.addEventListener('click', () => modal.classList.add('open'));
      modal.addEventListener('click', (e) => {
        if (!modalContent.contains(e.target)) modal.classList.remove('open');
      });
      return;
    }

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
      targetIndex = Math.max(0, Math.min(dots.length - 1, targetIndex));
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
