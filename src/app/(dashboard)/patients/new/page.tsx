'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ShieldCheck } from 'lucide-react'

export default function NewPatientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: '',
    phone: '',
    email: '',
    insuranceProvider: '',
    insuranceId: '',
    chiefComplaint: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[NewPatient] form data:', form)

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required.')
      return
    }
    if (!consentChecked) {
      setError('Informed consent must be acknowledged before creating a patient record.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      console.log('[NewPatient] API response:', res.status, data)

      if (!res.ok) {
        setError(data?.error ?? 'Failed to create patient. Please try again.')
        return
      }

      router.push(`/patients/${data.patient.id}`)
    } catch (err) {
      console.error('[NewPatient] fetch error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-shadow'

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">New Patient Profile</h1>
      <p className="text-sm text-gray-500 mb-6">Add a new patient to your practice</p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Demographics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Patient Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="Jane"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                placeholder="Smith"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sex</label>
              <select name="sex" value={form.sex} onChange={handleChange} className={inputCls}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                placeholder="(555) 000-0000"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="patient@email.com"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Insurance
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Provider</label>
              <input
                name="insuranceProvider"
                value={form.insuranceProvider}
                onChange={handleChange}
                placeholder="Blue Cross, Aetna…"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Insurance ID</label>
              <input
                name="insuranceId"
                value={form.insuranceId}
                onChange={handleChange}
                placeholder="Member ID"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Chief Complaint
          </h2>
          <textarea
            name="chiefComplaint"
            value={form.chiefComplaint}
            onChange={handleChange}
            rows={3}
            placeholder="Primary reason for seeking chiropractic care…"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Informed Consent — Iowa compliance */}
        <div className="bg-forest-50 rounded-xl border border-forest-200 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-forest-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-forest-800 mb-2">
                Informed Consent (Required)
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-forest-300 text-forest-600 focus:ring-forest-500"
                />
                <span className="text-xs text-forest-700 leading-relaxed">
                  The patient has been informed of the nature of chiropractic care, potential risks
                  and benefits, and has provided informed consent to proceed with chiropractic
                  evaluation and treatment. Consent has been documented in the patient record.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Patient…' : 'Create Patient Profile'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
