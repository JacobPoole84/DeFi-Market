
const textInput = document.getElementById('search-details')
const coinContainerEl = document.querySelector('.coin__container')
const searchSuggestion = document.querySelector('.search__suggestion')

const params = new URLSearchParams(window.location.search);
const searchValue = params.get("search");


async function renderCoin(filter) {
    const searchValue = textInput.value.trim()

    if (searchValue.length === 0) {
        //  render the empty-state message inside the results container
        coinContainerEl.innerHTML = `<div class="coin__row"><h1 class="search__suggestion">Please provide a valid search value.</h1></div>`
        return
    }

    // Fetch all coins market data (large list)
    const coin = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`)
    const allCoins = await coin.json()
    
    // Filter by partial match (name or symbol, case-insensitive)
    const searchLower = searchValue.toLowerCase()
    const coinData = allCoins.filter(c => 
        c.name.toLowerCase().includes(searchLower) || 
        c.symbol.toLowerCase().includes(searchLower)
    )
    
    if (coinData.length === 0) {
        // show a clear "no results" message inside the results container
        coinContainerEl.innerHTML = `<div class="coin__row"><h1 class="search__suggestion">No coins found matching "${searchValue}".</h1></div>`
        return
    } 
    
    coinContainerEl.innerHTML = coinData.slice(0, 6).map((coin) => coinHTML(coin)).join('')

    if (filter === 'NAME_SORT') {
        coinData.sort((a, b) => a.name.localeCompare(b.name))
        coinContainerEl.innerHTML = coinData.slice(0, 6).map((coin) => coinHTML(coin)).join('')
    } else if (filter === 'SYMBOL_SORT') {
        coinData.sort((a, b) => a.symbol.localeCompare(b.symbol))
        coinContainerEl.innerHTML = coinData.slice(0, 6).map((coin) => coinHTML(coin)).join('')
    } else if (filter === 'RANK_SORT') {
        coinData.sort((a, b) => a.market_cap_rank - b.market_cap_rank)
        coinContainerEl.innerHTML = coinData.slice(0, 6).map((coin) => coinHTML(coin)).join('')
    } else if (filter === 'PRICE_SORT') {
        coinData.sort((a, b) => b.current_price - a.current_price)
        coinContainerEl.innerHTML = coinData.slice(0, 6).map((coin) => coinHTML(coin)).join('')
    }
}

function filterCoins(event) {
        renderCoin(event.target.value)
}

    textInput.addEventListener('keyup', e => {
        e.preventDefault()
        if (e.key === "Enter") {
            renderCoin()
        }
    })

function coinHTML(coin) {
    return  `<div class="coin-info">
        <div class="coin-info__container">
            <h3>${coin.name}</h3>
            <p><b>Symbol:</b> <span class="uppercase">${coin.symbol}</span></p>
            <p><b>Rank:</b> ${coin.market_cap_rank}</p>
            <p><b>Price:</b> $${coin.current_price}</p>
        </div>
        <img src="${coin.image}" alt="">
    </div>`
}

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

    const MIN = 0    // represents $700M
    const MAX = 150000  // represents $30,000M = $30B

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

// If the browse page was opened with a search query, populate the input and run the search
document.addEventListener('DOMContentLoaded', () => {
    if (searchValue && searchValue.trim().length > 0) {
        textInput.value = searchValue
        renderCoin()
    }
})