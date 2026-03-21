'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Loader2, MicOff as MicBlocked } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  sessionId?: string
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'denied'

const WAVEFORM_BARS = 5

export function VoiceInput({ onTranscript, sessionId }: VoiceInputProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        setState('processing')
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        stream.getTracks().forEach((track) => track.stop())

        try {
          const formData = new FormData()
          formData.append('file', audioBlob, `session.${mimeType.includes('ogg') ? 'ogg' : 'webm'}`)
          formData.append('model', 'whisper-1')
          if (sessionId) formData.append('sessionId', sessionId)

          const res = await fetch('/api/ai/transcribe', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.text) {
            onTranscript(data.text)
          } else {
            setErrorMsg('No speech detected. Try again.')
          }
        } catch (err) {
          console.error('Transcription failed:', err)
          setErrorMsg('Transcription failed. Please type instead.')
        } finally {
          setState('idle')
        }
      }

      mediaRecorder.start()
      setState('recording')
    } catch (err: unknown) {
      const domErr = err as { name?: string }
      console.error('Microphone error:', err)
      if (domErr?.name === 'NotAllowedError' || domErr?.name === 'PermissionDeniedError') {
        setState('denied')
        setErrorMsg('Microphone access denied. Enable it in browser settings.')
      } else {
        setErrorMsg('Could not access microphone.')
      }
    }
  }, [onTranscript, sessionId])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const handleClick = () => {
    if (state === 'idle' || state === 'denied') {
      setState('idle')
      setErrorMsg(null)
      startRecording()
    } else if (state === 'recording') {
      stopRecording()
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'processing'}
        title={
          state === 'recording'
            ? 'Tap to stop recording'
            : state === 'denied'
            ? 'Microphone blocked — click to retry'
            : 'Start voice input'
        }
        className={cn(
          'relative p-3 rounded-xl transition-all duration-200 flex items-center justify-center',
          state === 'idle' && 'bg-gray-100 hover:bg-forest-50 hover:text-forest-600 text-gray-500',
          state === 'recording' && 'bg-red-500 hover:bg-red-600 text-white',
          state === 'processing' && 'bg-gray-100 text-gray-400 cursor-not-allowed',
          state === 'denied' && 'bg-orange-100 hover:bg-orange-200 text-orange-600'
        )}
      >
        {state === 'processing' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state === 'recording' ? (
          /* Waveform bars while recording */
          <span className="flex items-center gap-0.5 h-4 w-4">
            {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
              <span
                key={i}
                className="waveform-bar"
                style={{
                  animationDelay: `${i * 0.12}s`,
                  height: '4px',
                }}
              />
            ))}
          </span>
        ) : state === 'denied' ? (
          <MicBlocked size={16} />
        ) : (
          <Mic size={16} />
        )}
      </button>

      {errorMsg && (
        <p className="text-[10px] text-red-500 text-center max-w-[80px] leading-tight">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
