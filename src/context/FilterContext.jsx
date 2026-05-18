import React, { createContext, useContext, useState } from 'react'

const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [facility, setFacility] = useState('All')
  const [scope, setScope] = useState('All')
  const [s2Method, setS2Method] = useState('market')

  return (
    <FilterContext.Provider value={{ facility, setFacility, scope, setScope, s2Method, setS2Method }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  return useContext(FilterContext)
}
