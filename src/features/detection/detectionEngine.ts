import { useDetectionStore } from '@/features/detection/detectionStore'
import type { GameSystem } from '@/features/game/gameLoop'
import {
  createFaceDetector,
  detectFaces,
  disposeFaceDetector,
} from '@/services/vision/faceDetection'
import type { FaceDetection } from '@/services/vision/types'
import { CanvasSizer } from '@/utils/canvasSizer'
import { getErrorMessage } from '@/utils/errors'
import { computeCoverCrop } from '@/utils/geometry'

interface DetectionEngineOptions {
  minConfidence: number
}

const FACE_LABEL_COLOR = 'rgba(52, 211, 153, 0.9)'

function pickHighestConfidence(
  detections: FaceDetection[],
): FaceDetection | null {
  if (detections.length === 0) return null
  return detections.reduce((best, current) =>
    current.confidence > best.confidence ? current : best,
  )
}

export class DetectionEngine implements GameSystem {
  private readonly options: Required<DetectionEngineOptions>
  private detector: Awaited<ReturnType<typeof createFaceDetector>> | null = null
  private video: HTMLVideoElement | null = null
  private sizer: CanvasSizer | null = null
  private disposed = false

  constructor(options?: Partial<DetectionEngineOptions>) {
    this.options = { minConfidence: 0.5, ...options }
  }

  async initialize(video: HTMLVideoElement): Promise<void> {
    const { status } = useDetectionStore.getState()
    if (this.disposed || status === 'initializing' || status === 'ready') return

    this.video = video
    useDetectionStore.setState({ status: 'initializing', error: null })

    try {
      this.detector = await createFaceDetector()
      if (this.disposed) {
        this.releaseDetector()
        return
      }
      useDetectionStore.setState({ status: 'ready' })
    } catch (cause) {
      useDetectionStore.setState({
        status: 'error',
        error: getErrorMessage(
          cause,
          'Face detection could not be initialized.',
        ),
      })
    }
  }

  update(time: number): void {
    const { video, detector } = this
    if (!video || !detector || video.videoWidth <= 0) return

    const detections = detectFaces(detector, video, time)
    const best = pickHighestConfidence(detections)
    if (best && best.confidence < this.options.minConfidence) {
      useDetectionStore.setState({ lastDetection: null })
    } else {
      useDetectionStore.setState({ lastDetection: best })
    }

    this.drawDebug(detections)
  }

  dispose(): void {
    this.disposed = true
    this.video = null
    this.sizer?.dispose()
    this.sizer = null
    this.releaseDetector()
    useDetectionStore.setState({
      status: 'idle',
      error: null,
      lastDetection: null,
    })
  }

  private releaseDetector(): void {
    if (this.detector) {
      disposeFaceDetector(this.detector)
      this.detector = null
    }
  }

  private drawDebug(detections: FaceDetection[]): void {
    const canvas = useDetectionStore.getState().debugCanvas
    const { video } = this
    if (!canvas || !video) return

    const context = canvas.getContext('2d')
    if (!context) return

    if (!this.sizer || this.sizer.canvas !== canvas) {
      this.sizer?.dispose()
      this.sizer = new CanvasSizer(canvas)
    }

    this.sizer.applySize()
    const { width, height } = this.sizer

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, width, height)

    if (detections.length === 0) return

    const crop = computeCoverCrop(
      video.videoWidth,
      video.videoHeight,
      width,
      height,
    )
    context.setTransform(crop.scale, 0, 0, crop.scale, 0, 0)

    context.lineWidth = 3 / crop.scale
    context.strokeStyle = FACE_LABEL_COLOR
    context.font = `${Math.round(13 / crop.scale)}px ui-monospace, monospace`

    for (const detection of detections) {
      const x = detection.boundingBox.x - crop.offsetX
      const y = detection.boundingBox.y - crop.offsetY

      context.strokeRect(
        x,
        y,
        detection.boundingBox.width,
        detection.boundingBox.height,
      )

      const label = `face ${Math.round(detection.confidence * 100)}%`
      context.fillStyle = FACE_LABEL_COLOR
      context.fillText(label, x, y - 5 / crop.scale)
    }
  }
}
