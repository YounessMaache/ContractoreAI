'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DocumentBuilderLayout from './DocumentBuilderLayout'
import { Plus, Trash2, Camera, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface Expense {
  id: string
  date: string
  category: string
  vendor: string
  description: string
  amount: number
  receiptPhoto: string | null
  reimbursable: boolean
}

export default function ExpenseLogBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', date: '', category: 'Materials', vendor: '', description: '', amount: 0, receiptPhoto: null, reimbursable: false }
  ])
  const [notes, setNotes] = useState('')

  const addExpense = () => {
    setExpenses([...expenses, {
      id: Date.now().toString(),
      date: '',
      category: 'Materials',
      vendor: '',
      description: '',
      amount: 0,
      receiptPhoto: null,
      reimbursable: false
    }])
  }

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, [field]: value } : exp))
  }

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const handleReceiptUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      })

      const reader = new FileReader()
      reader.onloadend = () => {
        updateExpense(id, 'receiptPhoto', reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error compressing image:', error)
    }
  }

  const getTotalByCategory = () => {
    const totals: Record<string, number> = {}
    expenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount
    })
    return totals
  }

  const getGrandTotal = () => expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const getReimbursableTotal = () => expenses.filter(e => e.reimbursable).reduce((sum, exp) => sum + exp.amount, 0)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const documentData = {
        user_id: session.user.id,
        document_type: 'expense_log',
        document_number: `EXP-${Date.now()}`,
        status: 'draft',
        notes,
        total_amount: getGrandTotal(),
        data: {
          startDate,
          endDate,
          expenses,
          totalByCategory: getTotalByCategory(),
          grandTotal: getGrandTotal(),
          reimbursableTotal: getReimbursableTotal()
        }
      }

      const { error } = await supabase.from('documents').insert(documentData)
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error saving expense log:', error)
      alert('Failed to save expense log')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DocumentBuilderLayout
      title="Create Expense Log"
      onSave={handleSave}
      onPreview={() => {}}
      saving={saving}
    >
      <div className="space-y-6">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
            <button onClick={addExpense} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" />Add Expense
            </button>
          </div>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={expense.date}
                      onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={expense.category}
                      onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Materials">Materials</option>
                      <option value="Tools">Tools</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Meals">Meals</option>
                      <option value="Lodging">Lodging</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
                    <input
                      type="text"
                      value={expense.vendor}
                      onChange={(e) => updateExpense(expense.id, 'vendor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Store name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={expense.description}
                      onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="What was purchased"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={expense.reimbursable}
                        onChange={(e) => updateExpense(expense.id, 'reimbursable', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Reimbursable</span>
                    </label>
                    <label className="px-3 py-1 bg-blue-50 text-blue-700 rounded cursor-pointer hover:bg-blue-100 text-sm">
                      {expense.receiptPhoto ? '✓ Receipt' : '+ Receipt'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleReceiptUpload(expense.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button onClick={() => removeExpense(expense.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 space-y-3 border-t pt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Summary by Category</h3>
              {Object.entries(getTotalByCategory()).map(([category, total]) => (
                <div key={category} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">{category}:</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reimbursable Total:</span>
                <span className="font-medium">${getReimbursableTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span>${getGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </section>
      </div>
    </DocumentBuilderLayout>
  )
}
