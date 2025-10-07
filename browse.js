function openMenu() {
    // open menu
    document.body.classList.add('menu--open')
    // set button active state and aria
    const btn = document.querySelector('.btn__menu')
    if (btn) {
        btn.classList.add('is-active')
        btn.setAttribute('aria-expanded', 'true')
    }
    // trigger a single rotation on the opener icon
    const openerIcon = document.querySelector('.btn__menu .icon') || document.querySelector('.icon')
    if (openerIcon) {
        // remove previous class in case
        openerIcon.classList.remove('spin-once')
        // force reflow to allow re-triggering the animation if needed
        void openerIcon.offsetWidth
        openerIcon.classList.add('spin-once')
        // clean up the class after animation completes
        const cleanup = () => {
            openerIcon.classList.remove('spin-once')
            openerIcon.removeEventListener('animationend', cleanup)
        }
        openerIcon.addEventListener('animationend', cleanup)
    }
}

function closeMenu() {
    document.body.classList.remove('menu--open')
    const btn = document.querySelector('.btn__menu')
    if (btn) {
        btn.classList.remove('is-active')
        btn.setAttribute('aria-expanded', 'false')
    }
    const openerIcon = document.querySelector('.btn__menu .icon') || document.querySelector('.icon')
    if (openerIcon) {
        openerIcon.classList.remove('spin-once')
        void openerIcon.offsetWidth
        openerIcon.classList.add('spin-once')
        const cleanup = () => {
            openerIcon.classList.remove('spin-once')
            openerIcon.removeEventListener('animationend', cleanup)
        }
        openerIcon.addEventListener('animationend', cleanup)
    }
}

function setInlineProgress(pct, rootEl = document.querySelector('.progress-inline')) {
  if (!rootEl) return
  pct = Math.max(0, Math.min(100, pct))
  rootEl.setAttribute('aria-valuenow', String(pct))
  const fill = rootEl.querySelector('.progress-inline__fill')
  if (fill) fill.style.width = pct + '%'
}

// Auto-animate the inline progress from 0 -> 100 on page load
window.addEventListener('load', () => {
    const root = document.querySelector('.progress-inline')
    if (!root) return
    const fill = root.querySelector('.progress-inline__fill')
    if (!fill) return

    const duration = 1600 // ms
    const start = performance.now()

    function easeOutQuad(t) {
        return t * (2 - t)
    }

    function step(now) {
        const elapsed = now - start
        const t = Math.min(1, elapsed / duration)
        const eased = easeOutQuad(t)
        const pct = Math.round(eased * 100)
        setInlineProgress(pct, root)
        if (t < 1) {
            requestAnimationFrame(step)
        } else {
                // keep at 100% briefly then fade out
                setInlineProgress(100, root)
                setTimeout(() => {
                    root.classList.add('progress-complete')
                    root.setAttribute('aria-hidden', 'true')
                }, 300)
        }
    }

    // kickoff
    setInlineProgress(0, root)
    requestAnimationFrame(step)
})