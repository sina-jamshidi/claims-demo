'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Mail, Shield, User } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'super-admin'
  created_at: string
}

export default function AdminManagementPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'super-admin'>('admin')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && user?.role !== 'super-admin') {
      router.push('/dashboard')
    } else if (user?.role === 'super-admin') {
      fetchAdmins()
    }
  }, [user, loading, router])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoadingAdmins(false)
    }
  }

  const inviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteName.trim()) return

    setInviting(true)
    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      if (response.ok) {
        const newAdmin = await response.json()
        // Optimistic UI update
        setAdmins(prev => [newAdmin, ...prev])
        setInviteEmail('')
        setInviteName('')
        setInviteRole('admin')
        alert('Admin invited successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error inviting admin:', error)
      alert('Error inviting admin')
    } finally {
      setInviting(false)
    }
  }

  if (loading || (user && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">
          {loading ? 'Loading...' : 'Access denied. Super-admin role required.'}
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invite New Admin */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite New Admin
                </h2>
                
                <form onSubmit={inviteAdmin} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'admin' | 'super-admin')}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={inviting || !inviteEmail.trim() || !inviteName.trim()}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {inviting ? 'Inviting...' : 'Add Admin'}
                  </button>
                </form>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <Mail className="h-4 w-4 inline mr-1" />
                    In a real application, this would send an invitation email.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">All Administrators</h2>
                </div>
                
                {loadingAdmins ? (
                  <div className="p-6 text-center">Loading administrators...</div>
                ) : admins.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No administrators found
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <li key={admin.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900">
                                  {admin.name}
                                </p>
                                {admin.role === 'super-admin' && (
                                  <Shield className="ml-2 h-4 w-4 text-indigo-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              admin.role === 'super-admin' 
                                ? 'bg-indigo-100 text-indigo-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {admin.role}
                            </span>
                            <p className="text-xs text-gray-500">
                              Added {new Date(admin.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}