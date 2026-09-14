export class CanvasSizer {
  readonly canvas: HTMLCanvasElement
  width = 0
  height = 0
  dpr = 1

  private readonly observer: ResizeObserver

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.observer = new ResizeObserver(() => this.measure())
    this.observer.observe(canvas)
    this.measure()
  }

  applySize(): boolean {
    const changed =
      this.canvas.width !== this.width || this.canvas.height !== this.height
    if (changed) {
      this.canvas.width = this.width
      this.canvas.height = this.height
    }
    return changed
  }

  dispose(): void {
    this.observer.disconnect()
  }

  private measure(): void {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.width = Math.max(1, Math.round(rect.width * dpr))
    this.height = Math.max(1, Math.round(rect.height * dpr))
    this.dpr = dpr
  }
}
