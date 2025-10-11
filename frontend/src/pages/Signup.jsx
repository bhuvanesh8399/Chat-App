import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import toast from 'react-hot-toast'

export default function Signup() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', displayName: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.displayName) return toast.error('Fill all fields')
    setLoading(true)
    try {
      await register(form)
      nav('/chat', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block p-10">
        <div className="h-full w-full glass-dark rounded-3xl grid place-items-center shadow-soft">
          <img src="/auth-illustration.svg" className="max-w-[70%]" alt="illustration" onError={(e)=>{e.currentTarget.style.display='none'}}/>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }}
          className="w-full max-w-md p-8 glass-dark rounded-3xl shadow-soft"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Create account</h1>
            <p className="text-slate-300">Join the conversation</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm opacity-80">Display name</label>
              <input
                className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none focus:ring-2 ring-indigo-500/60"
                value={form.displayName}
                onChange={(e)=>setForm({...form, displayName:e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm opacity-80">Username</label>
              <input
                className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none focus:ring-2 ring-indigo-500/60"
                value={form.username}
                onChange={(e)=>setForm({...form, username:e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm opacity-80">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 outline-none focus:ring-2 ring-indigo-500/60"
                value={form.password}
                onChange={(e)=>setForm({...form, password:e.target.value})}
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2 font-medium hover:opacity-95 transition disabled:opacity-70"
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <div className="mt-4 text-sm text-center">
            Have an account? <Link to="/login" className="text-indigo-300 underline">Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
