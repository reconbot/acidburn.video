import React, { createContext, useState, useEffect, useMemo } from "react"

const readHash = () => document.location.hash.slice(1)
const setHash = (hash) => document.location.hash = hash ? `#${hash}` : ''

export const RouterContext = createContext<{ route: string; setRoute: any}>({ route: '', setRoute: null })

export const RouterProvider = function (props) {
  const [route, updateRoute] = useState(readHash())

  useEffect(() => {
    const emitChanges = () => updateRoute(readHash())
    window.addEventListener('hashchange', emitChanges)
    return () => window.removeEventListener('hashchange', emitChanges)
  }, [])

  const context = useMemo(() => {
    return {
      route,
      setRoute: setHash,
    }
  }, [route])

  return (<RouterContext.Provider value={context}>
    {props.children}
    </RouterContext.Provider>)
}
