'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Download } from 'lucide-react'

interface DocumentBuilderLayoutProps {
  title: string
  children: ReactNode
  onSave: () => Promise<void>
  onPreview: () => void
  saving?: boolean
}

export default function DocumentBuilderLayout({
  title,
  children,
  onSave,
  onPreview,
  saving = false,
}: DocumentBuilderLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPreview}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>
    </div>
  )
}
