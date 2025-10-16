'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DocumentBuilderLayout from './DocumentBuilderLayout'
import { Camera, X, Plus, Trash2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export default function InvoiceBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  // Form fields
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [jobLocation, setJobLocation] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ])
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [taxRate, setTaxRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [termsAndConditions, setTermsAndConditions] = useState('')

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
      setTaxRate(data.default_tax_rate || 0)
      setPaymentTerms(data.default_payment_terms || 'Net 30')
    }
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate
        }
        return updated
      }
      return item
    }))
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
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

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discount
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const invoiceNumber = profile 
        ? `${profile.invoice_prefix}${String(profile.invoice_next_number).padStart(3, '0')}`
        : `INV-${Date.now()}`

      const documentData = {
        user_id: session.user.id,
        document_type: 'invoice',
        document_number: invoiceNumber,
        status: 'draft',
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_address: clientAddress,
        job_location: jobLocation,
        notes,
        total_amount: calculateTotal(),
        due_date: dueDate,
        data: {
          lineItems,
          subtotal: calculateSubtotal(),
          taxRate,
          taxAmount: calculateTax(),
          discount,
          total: calculateTotal(),
          paymentTerms,
          termsAndConditions,
          invoiceDate
        },
        photos
      }

      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single()

      if (error) throw error

      // Update invoice number
      if (profile) {
        await supabase
          .from('profiles')
          .update({ invoice_next_number: profile.invoice_next_number + 1 })
          .eq('id', session.user.id)
      }

      router.push('/')
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    router.push('/documents/preview?type=invoice')
  }

  return (
    <DocumentBuilderLayout
      title="Create Invoice"
      onSave={handleSave}
      onPreview={handlePreview}
      saving={saving}
    >
      <div className="space-y-6">
        {/* Client Information */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Phone
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Address
              </label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </div>
        </section>

        {/* Invoice Details */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Location
              </label>
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="123 Job St"
              />
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              onClick={addLineItem}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          <div className="space-y-3">
            {lineItems.map((item) => (
              <div key={item.id} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Description"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="Qty"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  placeholder="Rate"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="w-28 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right">
                  ${item.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Tax:</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-600">%</span>
              </div>
              <span className="font-medium">${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Discount:</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Payment Terms */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any terms and conditions..."
              />
            </div>
          </div>
        </section>

        {/* Photos */}
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

        {/* Notes */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add any internal notes..."
          />
        </section>
      </div>
    </DocumentBuilderLayout>
  )
}
