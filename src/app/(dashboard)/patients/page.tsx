'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, User } from 'lucide-react'
import { format } from 'date-fns'

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  phone?: string
  email?: string
  _count: { sessions: number }
  createdAt: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true)
      const res = await fetch(`/api/patients?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setPatients(data.patients ?? [])
      setIsLoading(false)
    }
    fetchPatients()
  }, [search])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Patient Profiles</h1>
        <Link
          href="/patients/new"
          className="flex items-center gap-2 px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Patient
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
        />
      </div>

      {/* Patient list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <User size={20} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 mb-4">No patients yet</p>
            <Link
              href="/patients/new"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Add your first patient
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="text-sm font-medium text-forest-600 hover:underline"
                    >
                      {patient.lastName}, {patient.firstName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {patient.dateOfBirth
                      ? format(new Date(patient.dateOfBirth), 'MMM d, yyyy')
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{patient.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{patient._count.sessions}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">
                    {format(new Date(patient.createdAt), 'MMM d, yyyy')}
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
