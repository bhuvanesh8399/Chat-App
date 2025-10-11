import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { saveAuth, clearAuth, isAuthed, getName } from './auth'
import api from './apiClient'
import toast from 'react-hot-toast'

const AuthCtx = createContext(null)

export const AuthProvider = ({ children }) => {
  const [authed, setAuthed] = useState(isAuthed())
  const [displayName, setDisplayName] = useState(getName())

  const login = async ({ username, password }) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    saveAuth(data.token, data.displayName ?? username)
    setAuthed(true)
    setDisplayName(data.displayName ?? username)
    toast.success('Welcome back!')
  }

  const register = async ({ username, password, displayName }) => {
    const { data } = await api.post('/api/auth/register', { username, password, displayName })
    saveAuth(data.token, data.displayName ?? username)
    setAuthed(true)
    setDisplayName(data.displayName ?? username)
    toast.success('Account created!')
  }

  const logout = () => {
    clearAuth()
    setAuthed(false)
    toast('Signed out')
  }

  const value = useMemo(() => ({ authed, displayName, login, register, logout }), [authed, displayName])
  useEffect(() => {}, [authed])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
