import { Application, Graphics } from 'pixi.js'

async function main(): Promise<void> {
  const app = new Application()
  await app.init({ resizeTo: window, background: '#05070f', antialias: true })
  document.body.appendChild(app.canvas)
  const dot = new Graphics().circle(0, 0, 40).fill('#7fd1ff')
  dot.position.set(app.screen.width / 2, app.screen.height / 2)
  app.stage.addChild(dot)
}

void main()
