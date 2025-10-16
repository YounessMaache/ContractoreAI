'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import { generateDocumentPDF } from '@/lib/pdf-generator'

export default function DocumentEditPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadDocument()
  }, [])

  const loadDocument = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    setProfile(profileData)

    // Load document
    const { data: docData } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (docData) {
      setDocument(docData)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  const handleDownloadPDF = async () => {
    if (!document || !profile) return

    try {
      const pdf = await generateDocumentPDF(document, profile)
      pdf.save(`${document.document_number}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', params.id)

      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Document not found</h2>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{document.document_number}</h1>
              <p className="text-sm text-gray-600">{document.document_type.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Document Details</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              document.status === 'paid' ? 'bg-green-100 text-green-700' :
              document.status === 'sent' ? 'bg-blue-100 text-blue-700' :
              document.status === 'overdue' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {document.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Document Number</label>
              <p className="text-gray-900">{document.document_number}</p>
            </div>
            {document.client_name && (
              <div>
                <label className="text-sm font-medium text-gray-600">Client</label>
                <p className="text-gray-900">{document.client_name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600">Created</label>
              <p className="text-gray-900">{formatDate(document.created_at)}</p>
            </div>
            {document.total_amount && (
              <div>
                <label className="text-sm font-medium text-gray-600">Total Amount</label>
                <p className="text-gray-900 text-lg font-semibold">${document.total_amount.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {document.notes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{document.notes}</p>
          </div>
        )}

        {document.photos && document.photos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {document.photos.map((photo: string, index: number) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                  onClick={() => window.open(photo, '_blank')}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
