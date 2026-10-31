import React, { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router'
import { route } from './app.route.jsx'
import { useAuth } from '../features/auth/hooks/useAuth'

const App = () => {
  const auth = useAuth()
  const [ sessionChecked, setSessionChecked ] = useState(false)


  useEffect(() => {
       auth.handleGetMe().finally(() => setSessionChecked(true))
  }, [])

  if (!sessionChecked) return null

  return (
    <RouterProvider router={route} />
  )
}

export default App
