const TWO_PI = Math.PI * 2
const COLOR_MAIN = '#34d399'
const COLOR_CORE = '#f8fafc'

export interface ReticleDrawOptions {
  x: number
  y: number
  radius: number
  alpha: number
  dpr: number
}

export function drawReticle(
  context: CanvasRenderingContext2D,
  { x, y, radius, alpha, dpr }: ReticleDrawOptions,
): void {
  context.save()
  context.translate(x, y)
  context.globalAlpha = alpha

  const glow = context.createRadialGradient(
    0,
    0,
    radius * 0.3,
    0,
    0,
    radius * 1.25,
  )
  glow.addColorStop(0, 'rgba(52, 211, 153, 0.16)')
  glow.addColorStop(1, 'rgba(52, 211, 153, 0)')
  context.fillStyle = glow
  context.beginPath()
  context.arc(0, 0, radius * 1.25, 0, TWO_PI)
  context.fill()

  context.strokeStyle = COLOR_MAIN
  context.lineWidth = 1.6 * dpr
  context.beginPath()
  context.arc(0, 0, radius, 0, TWO_PI)
  context.stroke()

  context.lineCap = 'round'
  const tickInner = radius * 0.72
  const tickOuter = radius * 0.98
  for (let i = 0; i < 4; i += 1) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    context.beginPath()
    context.moveTo(cos * tickInner, sin * tickInner)
    context.lineTo(cos * tickOuter, sin * tickOuter)
    context.stroke()
  }

  context.fillStyle = COLOR_CORE
  context.beginPath()
  context.arc(0, 0, 2.6 * dpr, 0, TWO_PI)
  context.fill()

  context.restore()
}
