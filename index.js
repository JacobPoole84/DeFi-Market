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