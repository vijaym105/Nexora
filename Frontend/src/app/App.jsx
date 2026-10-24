import React, { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router'
import { route } from './app.route.jsx'
import { useAuth } from '../features/auth/hooks/useAuth'

const App = () => {
  const auth = useAuth()
  const [ sessionChecked, setSessionChecked ] = useState(false)

  // restore the session on page refresh before any route renders,
  // so a logged-in user isn't bounced to /login
  useEffect(() => {
    auth.handleGetMe().finally(() => setSessionChecked(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sessionChecked) return null

  return (
    <RouterProvider router={route} />
  )
}

export default App
