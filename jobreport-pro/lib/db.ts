import Dexie, { Table } from 'dexie'

export interface LocalDocument {
  id?: number
  supabaseId?: string
  userId: string
  documentType: string
  documentNumber: string
  status: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  jobLocation?: string
  jobTitle?: string
  data: any
  photos?: any
  notes?: string
  totalAmount?: number
  pdfUrl?: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  paidDate?: string
  sentDate?: string
  syncStatus: 'pending' | 'synced' | 'error'
}

export interface LocalPhoto {
  id?: number
  documentId: string
  blob: Blob
  filename: string
  uploaded: boolean
  supabaseUrl?: string
}

export class JobReportDB extends Dexie {
  documents!: Table<LocalDocument>
  photos!: Table<LocalPhoto>

  constructor() {
    super('JobReportDB')
    this.version(1).stores({
      documents: '++id, userId, documentType, status, syncStatus, supabaseId',
      photos: '++id, documentId, uploaded'
    })
  }
}

export const db = new JobReportDB()

// Sync pending documents to Supabase
export async function syncPendingDocuments(supabase: any, userId: string) {
  const pendingDocs = await db.documents
    .where('syncStatus')
    .equals('pending')
    .and(doc => doc.userId === userId)
    .toArray()

  const results = []

  for (const doc of pendingDocs) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: doc.userId,
          document_type: doc.documentType,
          document_number: doc.documentNumber,
          status: doc.status,
          client_name: doc.clientName,
          client_email: doc.clientEmail,
          client_phone: doc.clientPhone,
          client_address: doc.clientAddress,
          job_location: doc.jobLocation,
          job_title: doc.jobTitle,
          data: doc.data,
          photos: doc.photos,
          notes: doc.notes,
          total_amount: doc.totalAmount,
          pdf_url: doc.pdfUrl,
          due_date: doc.dueDate,
          paid_date: doc.paidDate,
          sent_date: doc.sentDate
        })
        .select()
        .single()

      if (data && !error) {
        await db.documents.update(doc.id!, {
          syncStatus: 'synced',
          supabaseId: data.id
        })
        results.push({ success: true, localId: doc.id, supabaseId: data.id })
      } else {
        await db.documents.update(doc.id!, { syncStatus: 'error' })
        results.push({ success: false, localId: doc.id, error })
      }
    } catch (err) {
      await db.documents.update(doc.id!, { syncStatus: 'error' })
      results.push({ success: false, localId: doc.id, error: err })
    }
  }

  return results
}
