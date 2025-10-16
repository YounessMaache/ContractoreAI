'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DocumentBuilderLayout from './DocumentBuilderLayout'
import { Plus, Trash2 } from 'lucide-react'

interface DayEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  totalHours: number
  notes: string
}

export default function TimeSheetBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  
  const [weekEnding, setWeekEnding] = useState(new Date().toISOString().split('T')[0])
  const [employeeName, setEmployeeName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [hourlyRate, setHourlyRate] = useState(0)
  const [entries, setEntries] = useState<DayEntry[]>([
    { id: '1', date: '', startTime: '', endTime: '', breakMinutes: 0, totalHours: 0, notes: '' }
  ])
  const [notes, setNotes] = useState('')

  const addEntry = () => {
    setEntries([...entries, {
      id: Date.now().toString(),
      date: '',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
      totalHours: 0,
      notes: ''
    }])
  }

  const updateEntry = (id: string, field: keyof DayEntry, value: any) => {
    setEntries(entries.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value }
        if (field === 'startTime' || field === 'endTime' || field === 'breakMinutes') {
          if (updated.startTime && updated.endTime) {
            const start = new Date(`2000-01-01T${updated.startTime}`)
            const end = new Date(`2000-01-01T${updated.endTime}`)
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            updated.totalHours = Math.max(0, diff - (updated.breakMinutes / 60))
          }
        }
        return updated
      }
      return entry
    }))
  }

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
  }

  const getTotalHours = () => entries.reduce((sum, e) => sum + e.totalHours, 0)
  const getTotalPay = () => getTotalHours() * hourlyRate

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const documentData = {
        user_id: session.user.id,
        document_type: 'time_sheet',
        document_number: `TS-${Date.now()}`,
        status: 'draft',
        client_name: employeeName,
        job_title: jobTitle,
        notes,
        total_amount: getTotalPay(),
        data: {
          weekEnding,
          employeeName,
          jobTitle,
          hourlyRate,
          entries,
          totalHours: getTotalHours(),
          totalPay: getTotalPay()
        }
      }

      const { error } = await supabase.from('documents').insert(documentData)
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error saving time sheet:', error)
      alert('Failed to save time sheet')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DocumentBuilderLayout
      title="Create Time Sheet"
      onSave={handleSave}
      onPreview={() => {}}
      saving={saving}
    >
      <div className="space-y-6">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week Ending</label>
              <input
                type="date"
                value={weekEnding}
                onChange={(e) => setWeekEnding(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Time Entries</h2>
            <button onClick={addEntry} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" />Add Entry
            </button>
          </div>
          <div className="space-y-3 overflow-x-auto">
            {entries.map((entry) => (
              <div key={entry.id} className="flex gap-2 items-start min-w-max">
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={entry.startTime}
                  onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                  placeholder="Start"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={entry.endTime}
                  onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                  placeholder="End"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={entry.breakMinutes}
                  onChange={(e) => updateEntry(entry.id, 'breakMinutes', parseFloat(e.target.value) || 0)}
                  placeholder="Break (min)"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="w-20 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right">
                  {entry.totalHours.toFixed(2)}h
                </div>
                <button onClick={() => removeEntry(entry.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between items-center border-t pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Hourly Rate:</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="w-24 px-3 py-1 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Hours: {getTotalHours().toFixed(2)}</div>
              <div className="text-lg font-bold">Total Pay: ${getTotalPay().toFixed(2)}</div>
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
