'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DocumentBuilderLayout from './DocumentBuilderLayout'
import { Camera, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export default function DailyJobReportBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [jobLocation, setJobLocation] = useState('')
  const [weather, setWeather] = useState('')
  const [temperature, setTemperature] = useState('')
  const [crewMembers, setCrewMembers] = useState('')
  const [workCompleted, setWorkCompleted] = useState('')
  const [materialsDelivered, setMaterialsDelivered] = useState('')
  const [equipmentUsed, setEquipmentUsed] = useState('')
  const [issues, setIssues] = useState('')
  const [safetyNotes, setSafetyNotes] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

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

      const documentData = {
        user_id: session.user.id,
        document_type: 'daily_job_report',
        document_number: `DJR-${Date.now()}`,
        status: 'completed',
        job_location: jobLocation,
        notes,
        data: {
          reportDate,
          weather,
          temperature,
          crewMembers: crewMembers.split('\n').filter(m => m.trim()),
          workCompleted,
          materialsDelivered: materialsDelivered.split('\n').filter(m => m.trim()),
          equipmentUsed: equipmentUsed.split('\n').filter(e => e.trim()),
          issues,
          safetyNotes,
          nextSteps
        },
        photos
      }

      const { error } = await supabase.from('documents').insert(documentData)
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error saving daily job report:', error)
      alert('Failed to save daily job report')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DocumentBuilderLayout
      title="Create Daily Job Report"
      onSave={handleSave}
      onPreview={() => {}}
      saving={saving}
    >
      <div className="space-y-6">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Location *</label>
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Sunny, Cloudy, Rainy..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="75°F"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crew & Equipment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crew Members (one per line)</label>
              <textarea
                value={crewMembers}
                onChange={(e) => setCrewMembers(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Used (one per line)</label>
              <textarea
                value={equipmentUsed}
                onChange={(e) => setEquipmentUsed(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Excavator&#10;Power drill&#10;Ladder"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Summary</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Completed *</label>
              <textarea
                value={workCompleted}
                onChange={(e) => setWorkCompleted(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe all work completed today..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materials Delivered (one per line)</label>
              <textarea
                value={materialsDelivered}
                onChange={(e) => setMaterialsDelivered(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="2x4 lumber (100 pieces)&#10;Concrete (5 bags)&#10;Nails (2 boxes)"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Issues & Safety</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issues/Delays</label>
              <textarea
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any issues or delays encountered..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Safety Notes</label>
              <textarea
                value={safetyNotes}
                onChange={(e) => setSafetyNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Safety observations, incidents, or concerns..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
              <textarea
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What needs to be done tomorrow or next..."
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
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
