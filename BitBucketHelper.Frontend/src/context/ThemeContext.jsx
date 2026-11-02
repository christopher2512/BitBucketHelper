import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getUserConfig } from '../api/client'

const ThemeContext = createContext({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light')

  // Apply theme to the <html> element whenever it changes.
  const applyTheme = useCallback((id) => {
    document.documentElement.setAttribute('data-theme', id)
  }, [])

  useEffect(() => {
    // Load the persisted theme from the backend on startup.
    getUserConfig()
      .then((cfg) => {
        if (cfg?.theme) {
          setThemeState(cfg.theme)
          applyTheme(cfg.theme)
        }
      })
      .catch(() => {
        // Backend not ready yet; keep the default theme.
      })
  }, [applyTheme])

  const setTheme = useCallback(
    (id) => {
      setThemeState(id)
      applyTheme(id)
    },
    [applyTheme],
  )

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
