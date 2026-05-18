import React from 'react'

export default function LoadingSkeleton() {
  const bar = (w, h = 16, mt = 0) => (
    <div style={{
      width: w,
      height: h,
      background: 'var(--linen)',
      marginTop: mt,
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  )

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, background: 'var(--white)', border: '0.5px solid var(--stone)', padding: 20 }}>
            {bar('60%', 10)}
            {bar('80%', 28, 12)}
            {bar('50%', 10, 8)}
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--white)', border: '0.5px solid var(--stone)', padding: 24 }}>
        {bar('40%', 12)}
        {bar('100%', 200, 16)}
      </div>
    </>
  )
}
