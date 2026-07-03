import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
          borderRadius: '8px',
          border: '1.5px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '5px',
            background: '#0B132B',
            color: '#38BDF8',
            fontSize: '14px',
            fontWeight: 900,
            fontFamily: 'sans-serif',
          }}
        >
          O
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
