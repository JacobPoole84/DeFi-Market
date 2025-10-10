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

// Price range slider logic (separate init so it runs reliably)
document.addEventListener('DOMContentLoaded', () => {
    const minInput = document.getElementById('rangeMin')
    const maxInput = document.getElementById('rangeMax')
    const trackSelected = document.getElementById('trackSelected')
    const minLabel = document.getElementById('minPriceLabel')
    const maxLabel = document.getElementById('maxPriceLabel')
    if (!minInput || !maxInput || !trackSelected) return

    const MIN = 700    // represents $700M
    const MAX = 30000  // represents $30,000M = $30B

    function clampValues() {
        let minVal = Math.min(Number(minInput.value), Number(maxInput.value) - 100)
        let maxVal = Math.max(Number(maxInput.value), Number(minInput.value) + 100)
        // enforce bounds
        minVal = Math.max(MIN, Math.min(MAX, minVal))
        maxVal = Math.max(MIN, Math.min(MAX, maxVal))
        minInput.value = minVal
        maxInput.value = maxVal
        return { minVal, maxVal }
    }

    function updateTrack() {
        const { minVal, maxVal } = clampValues()
        const range = MAX - MIN
        const leftPct = ((minVal - MIN) / range) * 100
        const rightPct = ((maxVal - MIN) / range) * 100
        trackSelected.style.left = leftPct + '%'
        trackSelected.style.width = (rightPct - leftPct) + '%'
        minLabel.textContent = formatPrice(minVal)
        maxLabel.textContent = formatPrice(maxVal)
    }

    function formatPrice(valueInM) {
        // valueInM is in millions; show $700M or $2.5B etc
        if (valueInM >= 1000) {
            const billions = (valueInM / 1000)
            // format with up to one decimal if necessary
            return '$' + (billions % 1 === 0 ? String(billions) : billions.toFixed(1)) + 'B'
        }
        return '$' + valueInM + 'M'
    }

    // wire events
    minInput.addEventListener('input', updateTrack)
    maxInput.addEventListener('input', updateTrack)

    // initial render
    updateTrack()
})