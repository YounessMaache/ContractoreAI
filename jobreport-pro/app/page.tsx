'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FileText, Receipt, ClipboardList, Clock, Package, FileCheck, DollarSign, ScrollText, Shield, StickyNote, Plus, Search, Filter, LogOut, Settings, User } from 'lucide-react'

interface Document {
  id: string
  document_type: string
  document_number: string
  client_name: string | null
  status: string
  total_amount: number | null
  created_at: string
}

const documentTypeIcons: Record<string, any> = {
  invoice: FileText,
  receipt: Receipt,
  work_order: ClipboardList,
  time_sheet: Clock,
  material_log: Package,
  daily_job_report: FileCheck,
  estimate: DollarSign,
  expense_log: ScrollText,
  warranty: Shield,
  notes: StickyNote,
}

const documentTypeLabels: Record<string, string> = {
  invoice: 'Invoice',
  receipt: 'Receipt',
  work_order: 'Work Order',
  time_sheet: 'Time Sheet',
  material_log: 'Material Log',
  daily_job_report: 'Daily Job Report',
  estimate: 'Estimate',
  expense_log: 'Expense Log',
  warranty: 'Warranty',
  notes: 'Notes',
}

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'recent' | 'by_type' | 'jobs'>('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      const isGuest = localStorage.getItem('guest_mode')
      if (!isGuest) {
        router.push('/login')
        return
      }
    } else {
      setUser(session.user)
      loadDocuments(session.user.id)
    }
    
    setLoading(false)
  }

  const loadDocuments = async (userId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data && !error) {
      setDocuments(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('guest_mode')
    router.push('/login')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'sent':
        return 'bg-blue-100 text-blue-700'
      case 'overdue':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredDocuments = documents.filter(doc => 
    doc.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.document_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">JobReport Pro</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'recent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setActiveTab('by_type')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'by_type'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            By Type
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'jobs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Jobs
          </button>
        </div>

        {/* Document List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-6">Create your first document to get started</p>
            <button
              onClick={() => router.push('/documents/new')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Document
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const Icon = documentTypeIcons[doc.document_type] || FileText
              return (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/documents/edit/${doc.id}`)}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {doc.client_name || 'Untitled'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {documentTypeLabels[doc.document_type]} • {doc.document_number}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{formatDate(doc.created_at)}</span>
                        {doc.total_amount && (
                          <span className="font-medium text-gray-900">
                            ${doc.total_amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/documents/new')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
