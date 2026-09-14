import { create } from 'zustand'
import {
  createCameraError,
  requestCameraStream,
  stopStream,
  toCameraError,
} from '@/services/camera/cameraService'
import type { CameraError, CameraStatus } from '@/types/camera'

interface CameraStore {
  status: CameraStatus
  error: CameraError | null
  videoElement: HTMLVideoElement | null
  start: () => Promise<void>
  stop: () => void
  registerVideoElement: (element: HTMLVideoElement | null) => void
}

export const useCameraStore = create<CameraStore>()((set, get) => ({
  status: 'idle',
  error: null,
  videoElement: null,

  registerVideoElement: (element) => {
    if (element === get().videoElement) return
    set({ videoElement: element })
  },

  start: async () => {
    const { status, videoElement } = get()
    if (status === 'requesting' || status === 'ready') return

    set({ status: 'requesting', error: null })

    if (!videoElement) {
      set({
        status: 'error',
        error: createCameraError('no-camera'),
      })
      return
    }

    try {
      const stream = await requestCameraStream()
      videoElement.srcObject = stream
      videoElement.muted = true
      await videoElement.play()
      set({ status: 'ready' })
    } catch (cause) {
      set({ status: 'error', error: toCameraError(cause) })
    }
  },

  stop: () => {
    const { videoElement } = get()
    if (videoElement?.srcObject instanceof MediaStream) {
      stopStream(videoElement.srcObject)
      videoElement.srcObject = null
    }
    set({ status: 'idle', error: null })
  },
}))
