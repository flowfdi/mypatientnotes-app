'use client'

/**
 * New Session Page — primary product surface.
 * Flow: Voice/text → AI follow-ups → Generate SOAP → Edit → Consent → Finalize & Archive
 */

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Send, Sparkles, CheckCircle, ChevronLeft, ShieldCheck, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOAPNoteEditor } from '@/components/session/SOAPNoteEditor'
import { VoiceInput } from '@/components/session/VoiceInput'
import { getStateRules } from '@/lib/compliance/state-rules'
import { CPTCodeSelector } from '@/components/session/CPTCodeSelector'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SOAPNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

// Default to Iowa rules in demo; in production this would come from practice settings
const STATE_CODE = 'IA'

export default function NewSessionPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [soapNote, setSOAPNote] = useState<SOAPNote>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [noteGenerated, setNoteGenerated] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [selectedCPT, setSelectedCPT] = useState<string[]>([])
  const [showRules, setShowRules] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const rules = getStateRules(STATE_CODE)

  useEffect(() => {
    const createSession = async () => {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      const data = await res.json()
      setSessionId(data.sessionId)
    }
    createSession()
  }, [patientId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || !sessionId) return
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages: newMessages, generateNote: false }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages([...newMessages, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages([...newMessages, { role: 'assistant', content: assistantText }])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleGenerateNote = async () => {
    if (!sessionId) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages, generateNote: true }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }

      const parseSection = (label: string) => {
        const regex = new RegExp(
          `\\*\\*${label}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]+:|$)`,
          'i'
        )
        const match = fullText.match(regex)
        return match ? match[1].trim() : ''
      }

      const parsed = {
        subjective: parseSection('SUBJECTIVE'),
        objective: parseSection('OBJECTIVE'),
        assessment: parseSection('ASSESSMENT'),
        plan: parseSection('PLAN'),
      }

      const missingSections = Object.entries(parsed)
        .filter(([, v]) => !v.trim())
        .map(([k]) => k)
      if (missingSections.length > 0) {
        console.warn('[SOAP parse] Missing sections:', missingSections)
      }

      setSOAPNote(parsed)
      setNoteGenerated(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFinalizeNote = async () => {
    if (!sessionId) return
    if (!consentConfirmed) {
      setFinalizeError('Please confirm informed consent before finalizing.')
      return
    }
    setFinalizeError(null)
    setIsFinalizing(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soapNote,
          cptCodes: selectedCPT,
          consentSigned: true,
          consentMethod: 'verbal',
        }),
      })
      if (!res.ok) {
        setFinalizeError('Failed to finalize note. Please try again.')
        return
      }
      setIsFinalized(true)
      setTimeout(() => router.push(`/patients/${patientId}`), 1500)
    } finally {
      setIsFinalizing(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ── Left panel: AI Conversation ── */}
      <div className="flex flex-col w-1/2 border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
          <button
            onClick={() => router.push(`/patients/${patientId}`)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900">Session Notes (SOAP)</h1>
            <p className="text-xs text-gray-400">AI-assisted documentation</p>
          </div>

          {/* State rules indicator */}
          <button
            type="button"
            onClick={() => setShowRules((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-forest-600 transition-colors"
          >
            <Info size={13} />
            {STATE_CODE}
          </button>

          {isFinalized && (
            <div className="flex items-center gap-1.5 text-forest-600 text-xs font-medium">
              <CheckCircle size={14} />
              Archived
            </div>
          )}
        </div>

        {/* State rules dropdown */}
        {showRules && (
          <div className="mx-4 mt-2 mb-0 p-3 bg-forest-50 border border-forest-200 rounded-lg text-xs text-forest-800">
            <p className="font-semibold mb-1.5">{rules.name} Chiropractic Rules</p>
            <ul className="space-y-1">
              {rules.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-forest-500">·</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={18} className="text-forest-500" />
              </div>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                Describe today&apos;s visit. I&apos;ll ask follow-up questions to build a complete
                SOAP note.
              </p>
            </div>
          )}

          {messages.map((message, i) => (
            <div
              key={i}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'bg-forest-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-5 py-4 border-t border-gray-100">
          {messages.length >= 2 && !noteGenerated && (
            <button
              onClick={handleGenerateNote}
              disabled={isGenerating || isLoading}
              className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={15} />
              {isGenerating ? 'Generating SOAP Note…' : 'Generate SOAP Note'}
            </button>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the session or answer follow-up questions…"
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <VoiceInput onTranscript={(t) => setInput((prev) => prev ? `${prev} ${t}` : t)} sessionId={sessionId ?? undefined} />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-forest-500 hover:bg-forest-600 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right panel: SOAP Note Editor ── */}
      <div className="flex flex-col w-1/2 bg-white">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">SOAP Note</h2>
            <p className="text-xs text-gray-400">
              {noteGenerated
                ? isFinalized
                  ? 'Finalized & archived'
                  : 'Review and edit before archiving'
                : 'Will appear after generation'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col">
          {!noteGenerated ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Complete the conversation, then click &ldquo;Generate SOAP Note&rdquo;
              </p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 gap-4">
              <SOAPNoteEditor
                note={soapNote}
                onChange={setSOAPNote}
                isFinalized={isFinalized}
              />

              {/* CPT Code selection */}
              {!isFinalized && noteGenerated && (
                <div className="border-t border-gray-100 pt-4">
                  <CPTCodeSelector selected={selectedCPT} onChange={setSelectedCPT} />
                </div>
              )}

              {/* Consent + Finalize */}
              {!isFinalized && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentConfirmed}
                      onChange={(e) => {
                        setConsentConfirmed(e.target.checked)
                        setFinalizeError(null)
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-forest-600 focus:ring-forest-500"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800">
                      <ShieldCheck
                        size={12}
                        className="inline mr-1 text-forest-500"
                      />
                      Informed consent for this treatment session was obtained and documented
                    </span>
                  </label>

                  {finalizeError && (
                    <p className="text-xs text-red-600">{finalizeError}</p>
                  )}

                  <button
                    onClick={handleFinalizeNote}
                    disabled={isFinalizing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={15} />
                    {isFinalizing ? 'Archiving…' : 'Finalize & Archive'}
                  </button>
                </div>
              )}

              {isFinalized && (
                <div className="flex items-center justify-center gap-2 py-3 text-forest-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  Note finalized and archived
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
