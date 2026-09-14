export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'error'

export type CameraErrorCode =
  | 'permission-denied'
  | 'no-camera'
  | 'camera-in-use'
  | 'insecure-context'
  | 'unsupported-mode'
  | 'unknown'

export interface CameraError {
  code: CameraErrorCode
  message: string
}

export function isCameraError(value: unknown): value is CameraError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value
  )
}
