'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DocumentBuilderLayout from './DocumentBuilderLayout'

export default function WarrantyBuilder() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [saving, setSaving] = useState(false)
  
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [jobLocation, setJobLocation] = useState('')
  const [jobReference, setJobReference] = useState('')
  const [workCovered, setWorkCovered] = useState('')
  const [duration, setDuration] = useState('1 year')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [expirationDate, setExpirationDate] = useState('')
  const [coverageDetails, setCoverageDetails] = useState('')
  const [exclusions, setExclusions] = useState('')
  const [claimsProcedure, setClaimsProcedure] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const documentData = {
        user_id: session.user.id,
        document_type: 'warranty',
        document_number: `WAR-${Date.now()}`,
        status: 'active',
        client_name: clientName,
        client_address: clientAddress,
        job_location: jobLocation,
        notes,
        data: {
          jobReference,
          workCovered,
          duration,
          startDate,
          expirationDate,
          coverageDetails,
          exclusions,
          claimsProcedure
        }
      }

      const { error } = await supabase.from('documents').insert(documentData)
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error saving warranty:', error)
      alert('Failed to save warranty')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DocumentBuilderLayout
      title="Create Warranty"
      onSave={handleSave}
      onPreview={() => {}}
      saving={saving}
    >
      <div className="space-y-6">
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Reference</label>
              <input
                type="text"
                value={jobReference}
                onChange={(e) => setJobReference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="INV-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Warranty Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Covered *</label>
              <textarea
                value={workCovered}
                onChange={(e) => setWorkCovered(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the work covered by this warranty..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="90 days">90 days</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="5 years">5 years</option>
                  <option value="10 years">10 years</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Details</label>
              <textarea
                value={coverageDetails}
                onChange={(e) => setCoverageDetails(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed information about what is covered..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What's Not Covered (Exclusions)</label>
              <textarea
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="List items or conditions not covered by this warranty..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claims Procedure</label>
              <textarea
                value={claimsProcedure}
                onChange={(e) => setClaimsProcedure(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="How to make a warranty claim..."
              />
            </div>
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
