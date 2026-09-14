import {
  isCameraError,
  type CameraError,
  type CameraErrorCode,
} from '@/types/camera'

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: false,
}

const ERROR_MESSAGES: Record<CameraErrorCode, string> = {
  'permission-denied':
    'Camera access was denied. Allow camera permission in your browser and try again.',
  'no-camera':
    'No camera was found on this device. Connect a webcam and try again.',
  'camera-in-use':
    'The camera is being used by another application. Close it and try again.',
  'insecure-context':
    'Camera access requires a secure (HTTPS) or localhost connection.',
  'unsupported-mode':
    'The requested camera mode is not supported by this device.',
  unknown: 'The camera could not be started. Please try again.',
}

export function createCameraError(
  code: CameraErrorCode,
  message = ERROR_MESSAGES[code],
): CameraError {
  return { code, message }
}

export function toCameraError(cause: unknown): CameraError {
  if (isCameraError(cause)) {
    return cause
  }

  if (cause instanceof DOMException) {
    switch (cause.name) {
      case 'NotAllowedError':
        return createCameraError('permission-denied')
      case 'NotFoundError':
        return createCameraError('no-camera')
      case 'NotReadableError':
      case 'AbortError':
        return createCameraError('camera-in-use')
      case 'OverconstrainedError':
        return createCameraError('unsupported-mode')
      case 'SecurityError':
        return createCameraError('insecure-context')
    }
  }

  return createCameraError('unknown')
}

export async function requestCameraStream(
  constraints: MediaStreamConstraints = DEFAULT_CONSTRAINTS,
): Promise<MediaStream> {
  const mediaDevices = navigator.mediaDevices

  if (!mediaDevices?.getUserMedia) {
    throw createCameraError('insecure-context')
  }

  try {
    return await mediaDevices.getUserMedia(constraints)
  } catch (cause) {
    throw toCameraError(cause)
  }
}

export function stopStream(stream: MediaStream | null): void {
  if (!stream) return
  stream.getTracks().forEach((track) => track.stop())
}
