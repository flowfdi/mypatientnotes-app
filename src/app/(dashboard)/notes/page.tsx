'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface NoteRow {
  id: string
  sessionId: string
  finalizedAt?: string
  session: {
    visitNumber: number
    sessionDate: string
    patient: { id: string; firstName: string; lastName: string }
    provider: { firstName: string; lastName: string }
  }
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true)
      const res = await fetch(`/api/notes?search=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes ?? [])
      }
      setIsLoading(false)
    }
    fetchNotes()
  }, [search])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Notes</h1>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by patient name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={24} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No finalized notes yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Patient', 'Visit', 'Date', 'Provider', 'Finalized'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/patients/${note.session.patient.id}/session/${note.sessionId}`}
                      className="text-sm font-medium text-blue-600 hover:underline">
                      {note.session.patient.lastName}, {note.session.patient.firstName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">#{note.session.visitNumber}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {format(new Date(note.session.sessionDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">Dr. {note.session.provider.lastName}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">
                    {note.finalizedAt ? format(new Date(note.finalizedAt), 'MMM d, h:mm a') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
