'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, CheckCircle, Clock, Printer, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import { SOAPNoteEditor } from '@/components/session/SOAPNoteEditor'
import { CPTCodeSelector } from '@/components/session/CPTCodeSelector'

interface SessionData {
  id: string
  sessionDate: string
  visitNumber: number
  status: string
  consentSigned?: boolean
  consentMethod?: string
  patient: { firstName: string; lastName: string }
  provider: { firstName: string; lastName: string }
  note?: {
    subjective?: string
    objective?: string
    assessment?: string
    plan?: string
    finalizedAt?: string
    icd10Codes?: string[]
    cptCodes?: string[]
  }
}

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`)
    if (!res.ok) { router.push(`/patients/${patientId}`); return }
    const data = await res.json()
    setSession(data.session)
    setIsLoading(false)
  }, [sessionId, patientId, router])

  useEffect(() => { fetchSession() }, [fetchSession])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-gray-400">
        <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-forest-500 animate-spin" />
        Loading session…
      </div>
    )
  }

  if (!session) return null

  const note = session.note
  const soapNote = {
    subjective: note?.subjective ?? '',
    objective: note?.objective ?? '',
    assessment: note?.assessment ?? '',
    plan: note?.plan ?? '',
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .print-container { padding: 0 !important; max-width: none !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="p-8 max-w-3xl mx-auto print-container">
        {/* Back nav */}
        <div className="no-print">
          <button
            onClick={() => router.push(`/patients/${patientId}`)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            {session.patient.firstName} {session.patient.lastName}
          </button>
        </div>

        {/* Print header */}
        <div className="print-only mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">ChiroNotes IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            {session.patient.firstName} {session.patient.lastName} — Visit #{session.visitNumber}
          </p>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Visit #{session.visitNumber}
              {session.consentSigned && (
                <span
                  title="Informed consent documented"
                  className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200"
                >
                  <ShieldCheck size={11} />
                  Consent {session.consentMethod ?? 'documented'}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {format(new Date(session.sessionDate), 'EEEE, MMMM d, yyyy')} · Dr.{' '}
              {session.provider.lastName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'FINALIZED' && (
              <button
                onClick={handlePrint}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
              >
                <Printer size={13} />
                Export / Print
              </button>
            )}
            {session.status === 'FINALIZED' ? (
              <div className="flex items-center gap-1.5 text-forest-600 text-sm font-medium">
                <CheckCircle size={15} />
                Finalized
                {note?.finalizedAt && (
                  <span className="text-gray-400 font-normal text-xs">
                    {format(new Date(note.finalizedAt), 'h:mm a')}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                <Clock size={15} />
                {session.status === 'IN_PROGRESS' ? 'In Progress' : 'Draft'}
              </div>
            )}
          </div>
        </div>

        {/* SOAP Note */}
        {session.status === 'FINALIZED' && note ? (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <SOAPNoteEditor note={soapNote} onChange={() => undefined} isFinalized />
            </div>

            {/* CPT Codes */}
            {note.cptCodes && note.cptCodes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <CPTCodeSelector
                  selected={note.cptCodes}
                  onChange={() => undefined}
                  readOnly
                />
              </div>
            )}

            {/* ICD-10 codes */}
            {note.icd10Codes && note.icd10Codes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  ICD-10 Diagnosis Codes
                </p>
                <div className="flex flex-wrap gap-2">
                  {note.icd10Codes.map((code) => (
                    <span
                      key={code}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-200"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Iowa compliance footer */}
            <div className="text-xs text-gray-400 text-center py-2 no-print">
              Iowa Admin. Code 645—43.3 · SOAP documentation required · AES-256 encrypted at rest
            </div>

            {/* Print footer */}
            <div className="print-only mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400">
              <p>Generated by ChiroNotes IA · HIPAA-compliant · AES-256-GCM encrypted</p>
              <p>Printed: {new Date().toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400 mb-4">This session has not been finalized yet.</p>
            <button
              onClick={() => router.push(`/patients/${patientId}/session/new`)}
              className="text-sm text-forest-600 hover:underline font-medium"
            >
              Continue in session editor
            </button>
          </div>
        )}
      </div>
    </>
  )
}
