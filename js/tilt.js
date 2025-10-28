// Personalización
(function personalize(){
    const p = new URLSearchParams(location.search);
    const name = (p.get('n') || '').trim();
    
    document.getElementById('permission-name').textContent = name || 'Invitado';
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', location.href.split('#')[0]);
})();

// ✅ SISTEMA DE MOVIMIENTO ULTRA-OPTIMIZADO
(function tilt(){
    const card = document.getElementById('card');
    const hint = document.getElementById('hint');
    const permissionOverlay = document.getElementById('permission-overlay');

    // Detección de capacidades
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
    const inApp = /(instagram|fbav|fban|line|wechat|whatsapp)/i.test(navigator.userAgent);
    const isSecure = location.protocol === 'https:';
    const hasTouch = 'ontouchstart' in window;

    if (reduceMotion){ 
    hint.textContent = 'Movimiento reducido activado en tu dispositivo.'; 
    return; 
    }

    // ========== CONFIGURACIÓN OPTIMIZADA ==========
    const config = {
    maxTilt: 20,           
    smoothing: 0.12,       
    deadZone: 0.02,        
    gyroSensitivity: 35,   
    mouseSensitivity: 1.2, 
    shadowIntensity: 0.3,  
    updateThreshold: 0.01  
    };

    // Estado del movimiento
    let state = {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    velocityX: 0,
    velocityY: 0,
    beta0: null,
    gamma0: null,
    isGyroActive: false,
    rafId: null,
    lastUpdate: 0,
    isAnimating: false
    };

    // ========== MOTOR DE ANIMACIÓN OPTIMIZADO ==========
    function render(timestamp) {
    if (!state.isAnimating) return;
    
    const deltaTime = timestamp - state.lastUpdate;
    if (deltaTime < 16) {
        state.rafId = requestAnimationFrame(render);
        return;
    }
    state.lastUpdate = timestamp;

    const diffX = state.targetX - state.currentX;
    const diffY = state.targetY - state.currentY;
    
    state.velocityX = diffX * config.smoothing;
    state.velocityY = diffY * config.smoothing;
    
    state.currentX += state.velocityX;
    state.currentY += state.velocityY;
    
    if (Math.abs(state.velocityX) > config.updateThreshold || 
        Math.abs(state.velocityY) > config.updateThreshold) {
        
        const transform = `translate3d(0,0,0) rotateX(${state.currentY.toFixed(2)}deg) rotateY(${state.currentX.toFixed(2)}deg)`;
        card.style.transform = transform;
        
        const shadowOffset = Math.abs(state.currentX) + Math.abs(state.currentY);
        const shadowBlur = 20 + shadowOffset * 2;
        const shadowOpacity = 0.18 + (shadowOffset / 40) * config.shadowIntensity;
        card.style.boxShadow = `0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0,0,0,${shadowOpacity})`;
    }
    
    if (Math.abs(diffX) > config.updateThreshold || Math.abs(diffY) > config.updateThreshold) {
        state.rafId = requestAnimationFrame(render);
    } else {
        state.isAnimating = false;
    }
    }

    function startAnimation() {
    if (!state.isAnimating) {
        state.isAnimating = true;
        state.rafId = requestAnimationFrame(render);
    }
    }

    function stopAnimation() {
    state.isAnimating = false;
    if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }
    }

    // ========== CONTROL POR MOUSE OPTIMIZADO ==========
    let mouseThrottleTimer = null;
    
    function handleMouseMove(e) {
    if (mouseThrottleTimer) return;
    
    mouseThrottleTimer = setTimeout(() => {
        mouseThrottleTimer = null;
    }, 16);

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const normX = ((e.clientX - centerX) / (rect.width / 2)) * config.mouseSensitivity;
    const normY = ((e.clientY - centerY) / (rect.height / 2)) * config.mouseSensitivity;
    
    state.targetX = Math.max(-config.maxTilt, Math.min(config.maxTilt, normX * config.maxTilt));
    state.targetY = Math.max(-config.maxTilt, Math.min(config.maxTilt, -normY * config.maxTilt));
    
    startAnimation();
    }

    // ========== CONTROL TÁCTIL OPTIMIZADO ==========
    function handleTouch(e) {
    if (!e.touches || !e.touches[0]) return;
    
    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const normX = ((touch.clientX - centerX) / (rect.width / 2));
    const normY = ((touch.clientY - centerY) / (rect.height / 2));
    
    state.targetX = Math.max(-config.maxTilt, Math.min(config.maxTilt, normX * config.maxTilt));
    state.targetY = Math.max(-config.maxTilt, Math.min(config.maxTilt, -normY * config.maxTilt));
    
    startAnimation();
    }

    function resetTilt() {
    state.targetX = 0;
    state.targetY = 0;
    startAnimation();
    
    setTimeout(() => {
        card.style.boxShadow = 'var(--shadow)';
    }, 300);
    }

    // ========== GIROSCOPIO OPTIMIZADO ==========
    let gyroThrottleTimer = null;
    
    function handleGyro(ev) {
    const { beta, gamma } = ev;
    if (beta === null || gamma === null) return;

    if (gyroThrottleTimer) return;
    gyroThrottleTimer = setTimeout(() => {
        gyroThrottleTimer = null;
    }, 20);

    if (state.beta0 === null) {
        state.beta0 = beta;
        state.gamma0 = gamma;
        hint.textContent = '¡Listo! Mueve el teléfono para ver el efecto 3D.';
        return;
    }

    const deltaBeta = (beta - state.beta0) / config.gyroSensitivity;
    const deltaGamma = (gamma - state.gamma0) / config.gyroSensitivity;
    
    if (Math.abs(deltaGamma) > config.deadZone) {
        state.targetX = Math.max(-1, Math.min(1, deltaGamma)) * config.maxTilt;
    }
    
    if (Math.abs(deltaBeta) > config.deadZone) {
        state.targetY = Math.max(-1, Math.min(1, -deltaBeta)) * config.maxTilt;
    }
    
    startAnimation();
    }

    function attachGyro() {
    if (state.isGyroActive) return;
    state.isGyroActive = true;
    window.addEventListener('deviceorientation', handleGyro, { passive: true });
    }

    // ========== EVENTOS ==========
    
    if (!hasTouch) {
    card.addEventListener('mouseenter', () => {
        card.classList.remove('smooth');
    }, { passive: true });
    
    card.addEventListener('mousemove', handleMouseMove, { passive: true });
    card.addEventListener('mouseleave', () => {
        card.classList.add('smooth');
        resetTilt();
    }, { passive: true });
    }

    if (hasTouch) {
    card.addEventListener('touchstart', (e) => {
        card.classList.remove('smooth');
        handleTouch(e);
    }, { passive: true });
    
    card.addEventListener('touchmove', handleTouch, { passive: true });
    
    card.addEventListener('touchend', () => {
        card.classList.add('smooth');
        resetTilt();
    }, { passive: true });
    }

    // ========== INICIALIZACIÓN ==========
    function initializeMotion() {
    permissionOverlay.classList.add('hidden');
    
    if (typeof DeviceOrientationEvent !== 'undefined') {
        if (typeof DeviceOrientationEvent.requestPermission === 'function' && isiOS) {
        DeviceOrientationEvent.requestPermission()
            .then(state => {
            if (state === 'granted') {
                attachGyro();
                hint.textContent = '¡Giroscopio activado! Mueve tu dispositivo.';
            } else {
                hint.textContent = 'Usa el dedo para mover la tarjeta.';
            }
            })
            .catch(() => {
            hint.textContent = 'Usa el dedo para mover la tarjeta.';
            });
        } else {
        attachGyro();
        }
    }
    
    startAnimation();
    setTimeout(resetTilt, 100);
    }

    permissionOverlay.addEventListener('click', initializeMotion, { once: true });

    // ========== CALIBRACIÓN CON DOBLE TAP ==========
    let lastTap = 0;
    card.addEventListener('touchend', (e) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
        state.beta0 = null;
        state.gamma0 = null;
        hint.textContent = 'Calibración reiniciada.';
        
        if ('vibrate' in navigator) {
        navigator.vibrate(50);
        }
    }
    lastTap = currentTime;
    }, { passive: false });

    // ========== LIMPIEZA AL DESCARGAR ==========
    window.addEventListener('beforeunload', () => {
    stopAnimation();
    window.removeEventListener('deviceorientation', handleGyro);
    });

    // ========== OPTIMIZACIÓN PARA VISIBILIDAD ==========
    document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAnimation();
    } else if (state.isGyroActive) {
        startAnimation();
    }
    });

})();