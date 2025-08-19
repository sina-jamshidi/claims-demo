'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, MessageSquare } from 'lucide-react'

interface Claim {
  id: string
  claimant_name: string
  date: string
  status: 'New' | 'In Review' | 'Closed'
  summary: string
  details: string
  created_at: string
}

interface ClaimNote {
  id: string
  claim_id: string
  author_id: string
  author_name: string
  note: string
  timestamp: string
}

export default function ClaimDetailsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const claimId = params.id as string

  const [claim, setClaim] = useState<Claim | null>(null)
  const [notes, setNotes] = useState<ClaimNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [loadingClaim, setLoadingClaim] = useState(true)
  const [savingNote, setSavingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user && claimId) {
      fetchClaim()
      fetchNotes()
    }
  }, [user, loading, router, claimId])

  const fetchClaim = async () => {
    try {
      const response = await fetch(`/api/claims/${claimId}`)
      if (response.ok) {
        const data = await response.json()
        setClaim(data)
      } else {
        console.error('Claim not found')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching claim:', error)
    } finally {
      setLoadingClaim(false)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/claims/${claimId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const updateClaimStatus = async (newStatus: 'New' | 'In Review' | 'Closed') => {
    if (!claim) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Optimistic UI update
        setClaim({ ...claim, status: newStatus })
      } else {
        alert('Error updating claim status')
      }
    } catch (error) {
      console.error('Error updating claim status:', error)
      alert('Error updating claim status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim() || !user) return

    setSavingNote(true)
    try {
      const response = await fetch(`/api/claims/${claimId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_id: user.id,
          note: newNote.trim(),
        }),
      })

      if (response.ok) {
        const newNoteData = await response.json()
        // Optimistic UI update - add the new note with author name
        const noteWithAuthor = {
          ...newNoteData,
          author_name: user.name
        }
        setNotes(prev => [...prev, noteWithAuthor])
        setNewNote('')
      } else {
        alert('Error adding note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Error adding note')
    } finally {
      setSavingNote(false)
    }
  }

  if (loading || loadingClaim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || !claim) {
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
            <h1 className="text-3xl font-bold text-gray-900">Claim Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Claim Details */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {claim.claimant_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Claim Date: {new Date(claim.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={claim.status}
                      onChange={(e) => updateClaimStatus(e.target.value as 'New' | 'In Review' | 'Closed')}
                      disabled={updatingStatus}
                      className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="New">New</option>
                      <option value="In Review">In Review</option>
                      <option value="Closed">Closed</option>
                    </select>
                    {updatingStatus && (
                      <Save className="h-4 w-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700">{claim.summary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Details</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{claim.details}</div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Internal Notes
                </h3>

                {/* Add Note Form */}
                <div className="mb-6">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal note..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim() || savingNote}
                    className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {savingNote ? 'Adding Note...' : 'Add Note'}
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {notes.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No notes yet. Add the first note above.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {note.author_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {note.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}