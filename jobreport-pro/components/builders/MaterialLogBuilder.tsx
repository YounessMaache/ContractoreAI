'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DocumentBuilderLayout from './DocumentBuilderLayout'
import { Plus, Trash2 } from 'lucide-react'

interface Material {
  id: string
  item: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
}

export default function MaterialLogBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [supplier, setSupplier] = useState('')
  const [jobLocation, setJobLocation] = useState('')
  const [materials, setMaterials] = useState<Material[]>([
    { id: '1', item: '', quantity: 1, unit: 'pcs', unitCost: 0, totalCost: 0 }
  ])
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState('')

  const addMaterial = () => {
    setMaterials([...materials, {
      id: Date.now().toString(),
      item: '',
      quantity: 1,
      unit: 'pcs',
      unitCost: 0,
      totalCost: 0
    }])
  }

  const updateMaterial = (id: string, field: keyof Material, value: any) => {
    setMaterials(materials.map(mat => {
      if (mat.id === id) {
        const updated = { ...mat, [field]: value }
        if (field === 'quantity' || field === 'unitCost') {
          updated.totalCost = updated.quantity * updated.unitCost
        }
        return updated
      }
      return mat
    }))
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  const getSubtotal = () => materials.reduce((sum, m) => sum + m.totalCost, 0)
  const getTax = () => getSubtotal() * (taxRate / 100)
  const getGrandTotal = () => getSubtotal() + getTax()

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const documentData = {
        user_id: session.user.id,
        document_type: 'material_log',
        document_number: `ML-${Date.now()}`,
        status: 'draft',
        job_location: jobLocation,
        notes,
        total_amount: getGrandTotal(),
        data: {
          logDate,
          supplier,
          materials,
          subtotal: getSubtotal(),
          taxRate,
          tax: getTax(),
          grandTotal: getGrandTotal()
        }
      }

      const { error } = await supabase.from('documents').insert(documentData)
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error saving material log:', error)
      alert('Failed to save material log')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DocumentBuilderLayout
      title="Create Material Log"
      onSave={handleSave}
      onPreview={() => {}}
      saving={saving}
    >
      <div className="space-y-6">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Date</label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Home Depot"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Location</label>
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
            <button onClick={addMaterial} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" />Add Material
            </button>
          </div>
          <div className="space-y-3">
            {materials.map((material) => (
              <div key={material.id} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={material.item}
                  onChange={(e) => updateMaterial(material.id, 'item', e.target.value)}
                  placeholder="Item name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={material.quantity}
                  onChange={(e) => updateMaterial(material.id, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="Qty"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={material.unit}
                  onChange={(e) => updateMaterial(material.id, 'unit', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pcs">pcs</option>
                  <option value="ft">ft</option>
                  <option value="m">m</option>
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                  <option value="gal">gal</option>
                  <option value="L">L</option>
                </select>
                <input
                  type="number"
                  value={material.unitCost}
                  onChange={(e) => updateMaterial(material.id, 'unitCost', parseFloat(e.target.value) || 0)}
                  placeholder="Unit Cost"
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="w-28 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right">
                  ${material.totalCost.toFixed(2)}
                </div>
                <button onClick={() => removeMaterial(material.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${getSubtotal().toFixed(2)}</span>
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
              <span className="font-medium">${getTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span>${getGrandTotal().toFixed(2)}</span>
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
