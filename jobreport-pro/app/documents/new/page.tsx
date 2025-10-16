'use client'

import { useRouter } from 'next/navigation'
import { FileText, Receipt, ClipboardList, Clock, Package, FileCheck, DollarSign, ScrollText, Shield, StickyNote, ArrowLeft } from 'lucide-react'

const documentTypes = [
  {
    id: 'invoice',
    label: 'Invoice',
    description: 'Bill clients for completed work',
    icon: FileText,
    color: 'bg-blue-500',
  },
  {
    id: 'receipt',
    label: 'Receipt',
    description: 'Record payment received',
    icon: Receipt,
    color: 'bg-green-500',
  },
  {
    id: 'work_order',
    label: 'Work Order',
    description: 'Track service requests',
    icon: ClipboardList,
    color: 'bg-purple-500',
  },
  {
    id: 'time_sheet',
    label: 'Time Sheet',
    description: 'Log hours worked',
    icon: Clock,
    color: 'bg-orange-500',
  },
  {
    id: 'material_log',
    label: 'Material Log',
    description: 'Track materials used',
    icon: Package,
    color: 'bg-yellow-500',
  },
  {
    id: 'daily_job_report',
    label: 'Daily Job Report',
    description: 'Daily progress tracking',
    icon: FileCheck,
    color: 'bg-teal-500',
  },
  {
    id: 'estimate',
    label: 'Estimate',
    description: 'Provide project quotes',
    icon: DollarSign,
    color: 'bg-indigo-500',
  },
  {
    id: 'expense_log',
    label: 'Expense Log',
    description: 'Track business expenses',
    icon: ScrollText,
    color: 'bg-red-500',
  },
  {
    id: 'warranty',
    label: 'Warranty',
    description: 'Issue warranty certificates',
    icon: Shield,
    color: 'bg-cyan-500',
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'Quick notes and reminders',
    icon: StickyNote,
    color: 'bg-pink-500',
  },
]

export default function NewDocumentPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Choose Document Type</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-gray-600 mb-6">Select the type of document you want to create</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => router.push(`/documents/create?type=${type.id}`)}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition text-left group"
              >
                <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.label}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
