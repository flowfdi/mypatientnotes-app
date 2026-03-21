'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Plus, FileText, Clock, User, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'

interface Session {
  id: string
  sessionDate: string
  visitNumber: number
  status: string
  consentSigned?: boolean
  provider: { firstName: string; lastName: string }
  note?: { finalizedAt?: string }
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  sex?: string
  phone?: string
  email?: string
  chiefComplaint?: string
  insuranceProvider?: string
  insuranceId?: string
  createdAt: string
  sessions: Session[]
}

export default function PatientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPatient = useCallback(async () => {
    const res = await fetch(`/api/patients/${patientId}`)
    if (!res.ok) { router.push('/patients'); return }
    const data = await res.json()
    setPatient(data.patient)
    setIsLoading(false)
  }, [patientId, router])

  useEffect(() => { fetchPatient() }, [fetchPatient])

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm text-gray-400">
        <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-forest-500 animate-spin" />
        Loading patient profile…
      </div>
    )
  }

  if (!patient) return null

  const age = patient.dateOfBirth
    ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.push('/patients')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        All Patients
      </button>

      {/* Patient Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center">
              <User size={22} className="text-forest-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {age !== null ? `${age} yrs` : ''}
                {patient.dateOfBirth
                  ? ` · DOB ${format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}`
                  : ''}
                {patient.sex ? ` · ${patient.sex}` : ''}
              </p>
            </div>
          </div>
          <Link
            href={`/patients/${patient.id}/session/new`}
            className="flex items-center gap-2 px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            Start Session
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: 'Phone', value: patient.phone },
            { label: 'Email', value: patient.email },
            { label: 'Insurance', value: patient.insuranceProvider },
            { label: 'Insurance ID', value: patient.insuranceId },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm text-gray-700 mt-0.5">{value ?? '—'}</p>
            </div>
          ))}
        </div>

        {patient.chiefComplaint && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1">Chief Complaint</p>
            <p className="text-sm text-gray-700">{patient.chiefComplaint}</p>
          </div>
        )}
      </div>

      {/* Session History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Session History (SOAP)</h2>
          <span className="text-xs text-gray-400">
            {patient.sessions.length} visit{patient.sessions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {patient.sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={24} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-4">No sessions yet</p>
            <Link
              href={`/patients/${patient.id}/session/new`}
              className="text-sm text-forest-600 hover:underline font-medium"
            >
              Start the first session
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {patient.sessions.map((session) => (
              <Link
                key={session.id}
                href={`/patients/${patient.id}/session/${session.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center group-hover:bg-forest-100 transition-colors">
                    <FileText size={14} className="text-forest-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Visit #{session.visitNumber} ·{' '}
                      {format(new Date(session.sessionDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      Dr. {session.provider.lastName}
                      {session.note?.finalizedAt
                        ? ` · Finalized ${format(new Date(session.note.finalizedAt), 'h:mm a')}`
                        : ''}
                      {session.consentSigned && (
                      <ShieldCheck size={11} className="text-forest-500" />
                      )}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    session.status === 'FINALIZED'
                      ? 'bg-forest-50 text-forest-700'
                      : session.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {session.status === 'FINALIZED'
                    ? 'Finalized'
                    : session.status === 'IN_PROGRESS'
                    ? 'In Progress'
                    : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
