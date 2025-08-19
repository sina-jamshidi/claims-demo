'use client'

export type UserRole = 'admin' | 'super-admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@claimbridge.com',
    role: 'admin'
  },
  'super-admin': {
    id: '2', 
    name: 'John Doe',
    email: 'john@claimbridge.com',
    role: 'super-admin'
  }
}

// Simple auth state management
let currentUser: User | null = null
let authListeners: ((user: User | null) => void)[] = []

export function getCurrentUser(): User | null {
  return currentUser
}

export function switchUser(role: UserRole) {
  currentUser = mockUsers[role]
  // Notify all listeners
  authListeners.forEach(listener => listener(currentUser))
  localStorage.setItem('claimbridge-current-role', role)
}

export function signOut() {
  currentUser = null
  authListeners.forEach(listener => listener(null))
  localStorage.removeItem('claimbridge-current-role')
}

export function initAuth() {
  // Check for saved role in localStorage
  const savedRole = localStorage.getItem('claimbridge-current-role') as UserRole
  if (savedRole && mockUsers[savedRole]) {
    currentUser = mockUsers[savedRole]
  } else {
    // Default to admin for demo
    currentUser = mockUsers.admin
    localStorage.setItem('claimbridge-current-role', 'admin')
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  authListeners.push(callback)
  // Call immediately with current state
  callback(currentUser)
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(listener => listener !== callback)
  }
}