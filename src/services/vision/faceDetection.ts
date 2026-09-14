import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import type { FaceDetection } from '@/services/vision/types'

const MEDIAPIPE_VERSION = '1.0.1'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'

export async function createFaceDetector(): Promise<FaceDetector> {
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
  return FaceDetector.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    minDetectionConfidence: 0.5,
  })
}

export function detectFaces(
  detector: FaceDetector,
  video: HTMLVideoElement,
  timestamp: number,
): FaceDetection[] {
  const result = detector.detectForVideo(video, timestamp)

  return result.detections.flatMap((detection) => {
    const box = detection.boundingBox
    if (!box || box.width <= 0 || box.height <= 0) return []

    const score = detection.categories[0]?.score ?? 0
    return [
      {
        boundingBox: {
          x: box.originX,
          y: box.originY,
          width: box.width,
          height: box.height,
        },
        confidence: score,
      },
    ]
  })
}

export function disposeFaceDetector(detector: FaceDetector): void {
  detector.close()
}
