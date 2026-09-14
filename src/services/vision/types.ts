export interface BoundingRect {
  x: number
  y: number
  width: number
  height: number
}

export interface FaceDetection {
  boundingBox: BoundingRect
  confidence: number
}
