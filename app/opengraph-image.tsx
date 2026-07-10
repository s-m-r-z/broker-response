import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 140,
            height: 140,
            borderRadius: 24,
            background: '#18181b',
            border: '1px solid #27272a',
            fontSize: 56,
            fontWeight: 700,
            color: '#3b82f6',
            marginBottom: 36,
          }}
        >
          BR
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#fafafa' }}>
          Broker Response
        </div>
        <div style={{ fontSize: 24, color: '#a1a1aa', marginTop: 12 }}>
          PureWL Compliance
        </div>
      </div>
    ),
    size
  )
}
