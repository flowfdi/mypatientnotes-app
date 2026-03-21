'use client'

import { cn } from '@/lib/utils'

export const CHIRO_CPT_CODES = [
  // CMT — most common Iowa chiro codes
  { code: '98940', desc: 'CMT, spinal — 1–2 regions', category: 'CMT' },
  { code: '98941', desc: 'CMT, spinal — 3–4 regions', category: 'CMT' },
  { code: '98942', desc: 'CMT, spinal — 5 regions', category: 'CMT' },
  { code: '98943', desc: 'CMT, extraspinal', category: 'CMT' },
  // Modalities
  { code: '97010', desc: 'Hot/cold packs', category: 'Modality' },
  { code: '97012', desc: 'Traction', category: 'Modality' },
  { code: '97014', desc: 'Electrical stimulation (unattended)', category: 'Modality' },
  { code: '97032', desc: 'Electrical stimulation (manual)', category: 'Modality' },
  { code: '97035', desc: 'Ultrasound', category: 'Modality' },
  { code: '97018', desc: 'Paraffin bath', category: 'Modality' },
  // Rehab
  { code: '97110', desc: 'Therapeutic exercise', category: 'Rehab' },
  { code: '97530', desc: 'Therapeutic activities', category: 'Rehab' },
  { code: '97140', desc: 'Manual therapy (non-CMT)', category: 'Rehab' },
]

const CATEGORIES = ['CMT', 'Modality', 'Rehab'] as const

interface CPTCodeSelectorProps {
  selected: string[]
  onChange: (codes: string[]) => void
  readOnly?: boolean
}

export function CPTCodeSelector({ selected, onChange, readOnly = false }: CPTCodeSelectorProps) {
  const toggle = (code: string) => {
    if (readOnly) return
    onChange(
      selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]
    )
  }

  if (readOnly && selected.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          CPT Codes Billed
        </p>
        {selected.length > 0 && (
          <span className="text-xs text-forest-600 font-medium">
            {selected.join(', ')}
          </span>
        )}
      </div>

      {readOnly ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((code) => {
            const item = CHIRO_CPT_CODES.find((c) => c.code === code)
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-forest-50 text-forest-700 text-xs font-medium rounded-lg border border-forest-200"
              >
                <span className="font-bold">{code}</span>
                {item && <span className="text-forest-500">· {item.desc}</span>}
              </span>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {CHIRO_CPT_CODES.filter((c) => c.category === cat).map(({ code, desc }) => {
                  const active = selected.includes(code)
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggle(code)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all',
                        active
                          ? 'bg-forest-500 text-white border-forest-600 font-medium'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-forest-300 hover:text-forest-700'
                      )}
                    >
                      <span className="font-bold">{code}</span>
                      <span className={cn('hidden sm:inline', active ? 'text-forest-100' : 'text-gray-400')}>
                        {desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
