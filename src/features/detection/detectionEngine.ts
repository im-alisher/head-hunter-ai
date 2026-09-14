import { useDetectionStore } from '@/features/detection/detectionStore'
import {
  createFaceDetector,
  detectFaces,
  disposeFaceDetector,
} from '@/services/vision/faceDetection'
import type { FaceDetection } from '@/services/vision/types'
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

export class DetectionEngine {
  private readonly options: Required<DetectionEngineOptions>
  private detector: Awaited<ReturnType<typeof createFaceDetector>> | null = null
  private rafId: number | null = null
  private video: HTMLVideoElement | null = null

  constructor(options?: Partial<DetectionEngineOptions>) {
    this.options = { minConfidence: 0.5, ...options }
  }

  async start(video: HTMLVideoElement): Promise<void> {
    const { status } = useDetectionStore.getState()
    if (status === 'initializing' || status === 'ready') return

    useDetectionStore.setState({ status: 'initializing', error: null })
    this.video = video

    try {
      this.detector = await createFaceDetector()
      useDetectionStore.setState({ status: 'ready' })
      this.rafId = requestAnimationFrame(this.tick)
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

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
    }
    this.rafId = null
    this.video = null

    if (this.detector) {
      disposeFaceDetector(this.detector)
      this.detector = null
    }

    useDetectionStore.setState({
      status: 'idle',
      error: null,
      lastDetection: null,
    })
  }

  private readonly tick = (time: number): void => {
    const { video, detector } = this

    if (video && detector && video.videoWidth > 0) {
      const detections = detectFaces(detector, video, time)
      const best = pickHighestConfidence(detections)
      if (best && best.confidence < this.options.minConfidence) {
        useDetectionStore.setState({ lastDetection: null })
      } else {
        useDetectionStore.setState({ lastDetection: best })
      }
      this.drawDebug(detections)
    }

    this.rafId = requestAnimationFrame(this.tick)
  }

  private drawDebug(detections: FaceDetection[]): void {
    const canvas = useDetectionStore.getState().debugCanvas
    const { video } = this
    if (!canvas || !video) return

    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = window.devicePixelRatio || 1
    const bounds = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(bounds.width * dpr))
    const height = Math.max(1, Math.round(bounds.height * dpr))

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

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
