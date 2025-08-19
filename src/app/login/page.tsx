'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { switchUser } from '@/lib/auth'
import { Shield, User } from 'lucide-react'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleLogin = (role: 'admin' | 'super-admin') => {
    switchUser(role)
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ClaimBridge Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Demo Login - Choose your role
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Login as Demo User</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleLogin('admin')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <User className="h-5 w-5 mr-2" />
                Login as Admin
                <span className="ml-2 text-xs text-gray-500">(Jane Smith)</span>
              </button>
              
              <button
                onClick={() => handleLogin('super-admin')}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Shield className="h-5 w-5 mr-2" />
                Login as Super Admin
                <span className="ml-2 text-xs text-indigo-200">(John Doe)</span>
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Demo Features:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Switch roles anytime using the role switcher</li>
              <li>• Generate fake claims to test the system</li>
              <li>• Admins can view and manage claims</li>
              <li>• Super-admins can also manage other admins</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}