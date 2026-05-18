import { useState, useEffect } from 'react'

export function useModuleData(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/.netlify/functions/${endpoint}`)
      .then(res => {
        if (!res.ok) throw new Error(`${endpoint} returned ${res.status}`)
        return res.json()
      })
      .then(json => { if (!cancelled) { setData(json); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false) } })

    return () => { cancelled = true }
  }, [endpoint])

  return { data, loading, error }
}
