export interface CoverCrop {
  offsetX: number
  offsetY: number
  sourceWidth: number
  sourceHeight: number
  scale: number
}

export function computeCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): CoverCrop {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    targetWidth <= 0 ||
    targetHeight <= 0
  ) {
    return { offsetX: 0, offsetY: 0, sourceWidth: 0, sourceHeight: 0, scale: 1 }
  }

  const scaleX = targetWidth / sourceWidth
  const scaleY = targetHeight / sourceHeight
  const scale = Math.max(scaleX, scaleY)

  const sourceW = targetWidth / scale
  const sourceH = targetHeight / scale
  const offsetX = (sourceWidth - sourceW) / 2
  const offsetY = (sourceHeight - sourceH) / 2

  return {
    offsetX,
    offsetY,
    sourceWidth: sourceW,
    sourceHeight: sourceH,
    scale,
  }
}
