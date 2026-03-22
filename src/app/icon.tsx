import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#2d6a4f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Spine / notepad icon — simplified SVG shapes */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Notepad body */}
          <rect x="4" y="3" width="12" height="14" rx="1.5" fill="white" opacity="0.95" />
          {/* Spine segments (vertebrae-style) */}
          <rect x="9" y="5" width="2" height="1.5" rx="0.3" fill="#2d6a4f" />
          <rect x="9" y="7.5" width="2" height="1.5" rx="0.3" fill="#2d6a4f" />
          <rect x="9" y="10" width="2" height="1.5" rx="0.3" fill="#2d6a4f" />
          <rect x="9" y="12.5" width="2" height="1.5" rx="0.3" fill="#2d6a4f" />
          {/* Center line (spinal cord) */}
          <rect x="9.7" y="5" width="0.6" height="9.5" rx="0.3" fill="#40916c" opacity="0.7" />
          {/* Top binding / clip */}
          <rect x="8" y="1.5" width="4" height="2" rx="0.5" fill="#40916c" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
