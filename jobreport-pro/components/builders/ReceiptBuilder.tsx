'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DocumentBuilderLayout from './DocumentBuilderLayout'
import { Camera, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export default function ReceiptBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  const [clientName, setClientName] = useState('')
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0])
  const [amountReceived, setAmountReceived] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [receivedFor, setReceivedFor] = useState('')
  const [invoiceReference, setInvoiceReference] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        })

        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('Error compressing image:', error)
      }
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const receiptNumber = `REC-${Date.now()}`

      const documentData = {
        user_id: session.user.id,
        document_type: 'receipt',
        document_number: receiptNumber,
        status: 'completed',
        client_name: clientName,
        notes,
        total_amount: amountReceived,
        data: {
          receiptDate,
          amountReceived,
          paymentMethod,
          receivedFor,
          invoiceReference
        },
        photos
      }

      const { error } = await supabase
        .from('documents')
        .insert(documentData)

      if (error) throw error

      router.push('/')
    } catch (error) {
      console.error('Error saving receipt:', error)
      alert('Failed to save receipt')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    router.push('/documents/preview?type=receipt')
  }

  return (
    <DocumentBuilderLayout
      title="Create Receipt"
      onSave={handleSave}
      onPreview={handlePreview}
      saving={saving}
    >
      <div className="space-y-6">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received From *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Client Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Date
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Received *
              </label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                required
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayPal">PayPal</option>
                <option value="Venmo">Venmo</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received For
              </label>
              <textarea
                value={receivedFor}
                onChange={(e) => setReceivedFor(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Description of payment received for..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Reference (Optional)
              </label>
              <input
                type="text"
                value={invoiceReference}
                onChange={(e) => setInvoiceReference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="INV-001"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
              <div className="text-center">
                <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">Upload Photos</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes..."
          />
        </section>
      </div>
    </DocumentBuilderLayout>
  )
}
