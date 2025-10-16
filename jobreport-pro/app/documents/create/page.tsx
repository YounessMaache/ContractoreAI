'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import InvoiceBuilder from '@/components/builders/InvoiceBuilder'
import ReceiptBuilder from '@/components/builders/ReceiptBuilder'
import WorkOrderBuilder from '@/components/builders/WorkOrderBuilder'
import TimeSheetBuilder from '@/components/builders/TimeSheetBuilder'
import MaterialLogBuilder from '@/components/builders/MaterialLogBuilder'
import DailyJobReportBuilder from '@/components/builders/DailyJobReportBuilder'
import EstimateBuilder from '@/components/builders/EstimateBuilder'
import ExpenseLogBuilder from '@/components/builders/ExpenseLogBuilder'
import WarrantyBuilder from '@/components/builders/WarrantyBuilder'
import NotesBuilder from '@/components/builders/NotesBuilder'

function DocumentCreateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const documentType = searchParams.get('type')

  if (!documentType) {
    router.push('/documents/new')
    return null
  }

  const renderBuilder = () => {
    switch (documentType) {
      case 'invoice':
        return <InvoiceBuilder />
      case 'receipt':
        return <ReceiptBuilder />
      case 'work_order':
        return <WorkOrderBuilder />
      case 'time_sheet':
        return <TimeSheetBuilder />
      case 'material_log':
        return <MaterialLogBuilder />
      case 'daily_job_report':
        return <DailyJobReportBuilder />
      case 'estimate':
        return <EstimateBuilder />
      case 'expense_log':
        return <ExpenseLogBuilder />
      case 'warranty':
        return <WarrantyBuilder />
      case 'notes':
        return <NotesBuilder />
      default:
        return <div>Unknown document type</div>
    }
  }

  return <div>{renderBuilder()}</div>
}

export default function DocumentCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DocumentCreateContent />
    </Suspense>
  )
}
