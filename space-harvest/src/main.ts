import { Application, Graphics } from 'pixi.js'
import { Rng } from './sim/core/rng'

// Cimientos: un fondo de estrellas con semilla fija hasta que lleguen las escenas del Hito 0.
const app = new Application()
await app.init({ resizeTo: window, background: '#05070d', antialias: true })
document.body.appendChild(app.canvas)

const rng = new Rng(1)
const stars = new Graphics()
for (let i = 0; i < 120; i++) {
  stars.circle(rng.next() * app.screen.width, rng.next() * app.screen.height, 0.5 + rng.next() * 1.5)
}
stars.fill({ color: 0xffffff, alpha: 0.8 })
app.stage.addChild(stars)
