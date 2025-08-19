'use client'

import { UserRole, switchUser } from '@/lib/auth'
import { useAuth } from './auth-provider'
import { Shield, User } from 'lucide-react'

export function RoleSwitcher() {
  const { user } = useAuth()

  if (!user) return null

  const handleRoleSwitch = (role: UserRole) => {
    switchUser(role)
  }

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border p-3">
      <span className="text-sm font-medium text-gray-700">Demo Mode:</span>
      <div className="flex space-x-1">
        <button
          onClick={() => handleRoleSwitch('admin')}
          className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            user.role === 'admin'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <User className="h-3 w-3 mr-1" />
          Admin
        </button>
        <button
          onClick={() => handleRoleSwitch('super-admin')}
          className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            user.role === 'super-admin'
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Shield className="h-3 w-3 mr-1" />
          Super Admin
        </button>
      </div>
    </div>
  )
}