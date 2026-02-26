/* ========================================
   ADVANCED ANIMATIONS
   ======================================== */

/* Page Transitions */
.page-transition {
    animation: pageTransition 0.5s ease;
}

@keyframes pageTransition {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Hover Effects */
.hover-lift {
    transition: transform var(--transition-normal);
}

.hover-lift:hover {
    transform: translateY(-5px);
}

.hover-scale {
    transition: transform var(--transition-normal);
}

.hover-scale:hover {
    transform: scale(1.05);
}

.hover-rotate {
    transition: transform var(--transition-normal);
}

.hover-rotate:hover {
    transform: rotate(5deg);
}

.hover-glow {
    transition: box-shadow var(--transition-normal);
}

.hover-glow:hover {
    box-shadow: var(--shadow-gold);
}

.hover-border {
    position: relative;
}

.hover-border::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--gold-100);
    transition: all var(--transition-normal);
    transform: translateX(-50%);
}

.hover-border:hover::after {
    width: 100%;
}

/* Shimmer Effect */
.shimmer {
    position: relative;
    overflow: hidden;
}

.shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
    );
    transform: translateX(-100%);
    animation: shimmer 2s infinite;
}

/* Floating Animation */
.float {
    animation: float 3s ease infinite;
}

/* Pulse Animation */
.pulse {
    animation: pulse 2s ease infinite;
}

/* Spin Animation */
.spin {
    animation: spin 2s linear infinite;
}

/* Bounce Animation */
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.bounce {
    animation: bounce 2s ease infinite;
}

/* Slide In Animations */
.slide-in-left {
    animation: slideInLeft 0.5s ease;
}

.slide-in-right {
    animation: slideInRight 0.5s ease;
}

.slide-in-up {
    animation: slideInUp 0.5s ease;
}

.slide-in-down {
    animation: slideInDown 0.5s ease;
}

@keyframes slideInDown {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Fade Animations */
.fade-in {
    animation: fadeIn 0.5s ease;
}

.fade-out {
    animation: fadeOut 0.5s ease;
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}

/* Scale Animations */
.scale-in {
    animation: scaleIn 0.3s ease;
}

.scale-out {
    animation: scaleOut 0.3s ease;
}

@keyframes scaleOut {
    from {
        transform: scale(1);
        opacity: 1;
    }
    to {
        transform: scale(0.9);
        opacity: 0;
    }
}

/* Rotate In */
.rotate-in {
    animation: rotateIn 0.5s ease;
}

@keyframes rotateIn {
    from {
        transform: rotate(-180deg) scale(0);
        opacity: 0;
    }
    to {
        transform: rotate(0) scale(1);
        opacity: 1;
    }
}

/* Flip In */
.flip-in {
    animation: flipIn 0.5s ease;
}

@keyframes flipIn {
    from {
        transform: perspective(400px) rotateY(90deg);
        opacity: 0;
    }
    to {
        transform: perspective(400px) rotateY(0);
        opacity: 1;
    }
}

/* Glitch Effect */
.glitch {
    position: relative;
}

.glitch::before,
.glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch::before {
    animation: glitch-1 0.5s infinite linear alternate-reverse;
    color: #ff00ff;
    z-index: -1;
}

.glitch::after {
    animation: glitch-2 0.5s infinite linear alternate-reverse;
    color: #00ffff;
    z-index: -2;
}

@keyframes glitch-1 {
    0% { clip-path: inset(20% 0 30% 0); transform: translate(-2px, 2px); }
    100% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
}

@keyframes glitch-2 {
    0% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -2px); }
    100% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 2px); }
}

/* Text Reveal */
.text-reveal {
    animation: textReveal 1s ease forwards;
    opacity: 0;
}

@keyframes textReveal {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Gradient Shift */
.gradient-shift {
    background: linear-gradient(
        90deg,
        var(--gold-100),
        var(--gold-200),
        var(--gold-100)
    );
    background-size: 200% auto;
    animation: gradientShift 3s linear infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

@keyframes gradientShift {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
}

/* Ripple Effect */
.ripple {
    position: relative;
    overflow: hidden;
}

.ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    animation: ripple 1s ease-out;
}

@keyframes ripple {
    0% {
        width: 0;
        height: 0;
        opacity: 1;
    }
    100% {
        width: 200px;
        height: 200px;
        opacity: 0;
    }
}

/* Loading Bar */
.loading-bar {
    position: relative;
    height: 3px;
    background: var(--glass-border);
    overflow: hidden;
}

.loading-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    background: var(--gold-100);
    animation: loading 1s ease infinite;
}

@keyframes loading {
    0% { left: -50%; }
    100% { left: 100%; }
}

/* Particle Effect */
.particles {
    position: relative;
    overflow: hidden;
}

.particle {
    position: absolute;
    width: 5px;
    height: 5px;
    background: var(--gold-100);
    border-radius: 50%;
    opacity: 0.5;
    animation: particle 3s linear infinite;
}

@keyframes particle {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.5;
    }
    100% {
        transform: translateY(-100px) rotate(360deg);
        opacity: 0;
    }
}

/* Typewriter Effect */
.typewriter {
    overflow: hidden;
    border-right: 2px solid var(--gold-100);
    white-space: nowrap;
    animation: typewriter 3s steps(40) 1s 1 normal both,
               blink 0.75s step-end infinite;
}

@keyframes typewriter {
    from { width: 0; }
    to { width: 100%; }
}

@keyframes blink {
    from, to { border-color: transparent; }
    50% { border-color: var(--gold-100); }
}

/* Confetti Effect */
.confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--gold-100);
    animation: confetti 3s ease-out forwards;
}

@keyframes confetti {
    0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}