// app/admin/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Shield, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import IndianEmblem from '@/components/IndianEmblem'
import AdminDashboard from '@/components/AdminDashboard'
import { phpAPI } from '@/lib/php-api-client'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null) // null = checking
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    otp: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-login if token exists
  // Auto-login if session exists
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await phpAPI.getUserDetails()

        if (data && data.user && data.type === 'admin') {
          setIsLoggedIn(true)
        } else {
          // If logged in as user but not admin, or not logged in at all
          setIsLoggedIn(false)
          // Optional: If logged in as user, maybe logout or show message?
          // For now, just show login screen (which will effectively force re-login as admin)
        }
      } catch (err) {
        setIsLoggedIn(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (step === 'credentials') {
        setStep('otp')
      } else if (step === 'otp') {
        // phpAPI.login throws if failed
        const response = await phpAPI.login(
          'admin',
          loginData.email,
          loginData.password,
          loginData.otp
        )

        // Login successful (cookie set by backend)

        // Don't store auth_token!
        // localStorage.setItem('auth_token', response.token)
        console.log('Admin login successful:', response)
        localStorage.setItem('user', JSON.stringify(response.user))
        setIsLoggedIn(true)
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    phpAPI.logout()
    setIsLoggedIn(false)
    setStep('credentials')
    setLoginData({ email: '', password: '', otp: '' })
  }

  // Show loading while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    )
  }

  // Show dashboard if logged in
  if (isLoggedIn) {
    return <AdminDashboard onLogout={handleLogout} />
  }

  // Login UI
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* ... your existing login UI ... */}
      <div className="relative w-full max-w-md">
        {/* Government Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <IndianEmblem size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-blue-200">Consulate General of India, Johannesburg</p>
          <div className="w-16 h-0.5 bg-saffron mx-auto mt-3"></div>
        </div>

        <div className="bg-white/15 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="bg-white/10 px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-saffron" />
              <span className="text-white font-medium">
                {step === 'credentials' ? 'Officer Login' : 'Two-Factor Authentication'}
              </span>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              {step === 'credentials' && (
                <>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Officer ID / Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                      <input
                        type="text"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/40 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-saffron focus:border-transparent"
                        placeholder="Enter your officer ID"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-saffron focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === 'otp' && (
                <div>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-saffron/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-8 w-8 text-saffron" />
                    </div>
                    <h3 className="text-white font-medium mb-1">Enter Verification Code</h3>
                    <p className="text-white/60 text-sm">
                      A 6-digit code has been sent to your registered device
                    </p>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={loginData.otp}
                      onChange={(e) => setLoginData({ ...loginData, otp: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-lg tracking-widest placeholder-white/50 focus:ring-2 focus:ring-saffron focus:border-transparent"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-saffron hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    {step === 'credentials' ? 'Continuing...' : 'Verifying...'}
                  </>
                ) : (
                  step === 'credentials' ? 'Continue' : 'Verify & Login'
                )}
              </button>
            </form>

            {step === 'otp' && (
              <button
                onClick={() => setStep('credentials')}
                className="w-full mt-3 text-white/60 hover:text-white text-sm transition-colors"
              >
                Back to login
              </button>
            )}
          </div>

          <div className="bg-red-500/20 border-t border-red-500/30 px-6 py-3">
            <div className="flex items-center space-x-2 text-red-200">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                Authorized Personnel Only - All access is logged and monitored
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-200 text-xs text-center">
            <strong>Demo:</strong> officer123 | demo2025 | OTP: 000000
          </p>
        </div>
      </div>
    </div>
  )
}