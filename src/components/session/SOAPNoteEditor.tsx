'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SOAPNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

interface SOAPNoteEditorProps {
  note: SOAPNote
  onChange: (note: SOAPNote) => void
  isFinalized?: boolean
}

const SECTIONS = [
  {
    key: 'subjective' as keyof SOAPNote,
    label: 'Subjective',
    abbr: 'S',
    color: 'blue',
    hint: 'Patient-reported symptoms, pain rating (0–10), onset, duration, aggravating/relieving factors, functional limitations',
    placeholder:
      'e.g. Patient reports lower back pain at 4/10. Onset 3 weeks ago after lifting. Worsens with prolonged sitting. No radicular symptoms. Previous visit was 6/10.',
  },
  {
    key: 'objective' as keyof SOAPNote,
    label: 'Objective',
    abbr: 'O',
    color: 'purple',
    hint: 'Clinical findings: ROM, postural assessment, orthopedic/neurological tests, palpation findings, spinal levels adjusted, techniques used',
    placeholder:
      'e.g. Lumbar flexion 60° (improved from 45°). SLR negative bilaterally. L4-L5 restricted — adjusted using Diversified technique with good cavitation. Applied moist heat 10 min pre-adjustment.',
  },
  {
    key: 'assessment' as keyof SOAPNote,
    label: 'Assessment',
    abbr: 'A',
    color: 'amber',
    hint: 'Clinical impression, ICD-10 diagnosis codes, progress toward care goals, response to treatment',
    placeholder:
      'e.g. Lumbar sprain/strain (M54.5), improving. Patient responding well — pain reduced 33% from last visit. Functional goals on track. No red flags identified.',
  },
  {
    key: 'plan' as keyof SOAPNote,
    label: 'Plan',
    abbr: 'P',
    color: 'emerald',
    hint: 'Treatment performed today, home care instructions, next visit frequency, referrals. Iowa: No controlled substances. Include CPT codes.',
    placeholder:
      'e.g. Adjusted L4-L5 and L5-S1 Diversified (CPT 98941). Moist heat 10 min (CPT 97010). HEP: McKenzie extensions 2×/day. Next visit in 1 week. Re-evaluate in 3 visits.',
  },
]

const colorMap: Record<string, { badge: string; tab: string; active: string; ring: string }> = {
  blue: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    tab: 'text-blue-600 border-blue-400',
    active: 'bg-blue-50',
    ring: 'focus:ring-blue-400',
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    tab: 'text-purple-600 border-purple-400',
    active: 'bg-purple-50',
    ring: 'focus:ring-purple-400',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    tab: 'text-amber-600 border-amber-400',
    active: 'bg-amber-50',
    ring: 'focus:ring-amber-400',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tab: 'text-emerald-600 border-emerald-400',
    active: 'bg-emerald-50',
    ring: 'focus:ring-emerald-400',
  },
}

export function SOAPNoteEditor({ note, onChange, isFinalized = false }: SOAPNoteEditorProps) {
  const [activeTab, setActiveTab] = useState<keyof SOAPNote>('subjective')

  const handleChange = (key: keyof SOAPNote, value: string) => {
    onChange({ ...note, [key]: value })
  }

  const activeSection = SECTIONS.find((s) => s.key === activeTab)!
  const colors = colorMap[activeSection.color]

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-4 -mx-0">
        {SECTIONS.map(({ key, abbr, label, color }) => {
          const c = colorMap[color]
          const isActive = activeTab === key
          const hasContent = note[key].trim().length > 0
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all flex-1 justify-center',
                isActive
                  ? `border-b-2 ${c.tab}`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border',
                  isActive ? c.badge : 'bg-gray-50 text-gray-400 border-gray-200'
                )}
              >
                {abbr}
              </span>
              <span className="hidden sm:inline">{label}</span>
              {hasContent && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Active section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-2">
          <p className="text-xs text-gray-400 leading-relaxed">{activeSection.hint}</p>
        </div>

        {isFinalized ? (
          <div
            className={cn(
              'flex-1 rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[160px]',
              colors.active
            )}
          >
            {note[activeTab] || (
              <span className="text-gray-400 italic">Not documented</span>
            )}
          </div>
        ) : (
          <textarea
            value={note[activeTab]}
            onChange={(e) => handleChange(activeTab, e.target.value)}
            placeholder={activeSection.placeholder}
            rows={8}
            className={cn(
              'flex-1 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent leading-relaxed transition-shadow',
              colors.ring
            )}
          />
        )}

        {/* Section completeness indicator */}
        {!isFinalized && (
          <div className="flex gap-1.5 mt-3 justify-center">
            {SECTIONS.map(({ key, color }) => {
              const c = colorMap[color]
              const filled = note[key].trim().length > 0
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    activeTab === key ? 'w-6' : 'w-1.5',
                    filled
                      ? activeTab === key
                        ? c.tab.split(' ')[0].replace('text', 'bg')
                        : 'bg-emerald-300'
                      : 'bg-gray-200'
                  )}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
