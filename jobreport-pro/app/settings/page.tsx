'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, Camera, CreditCard, Crown } from 'lucide-react'
import imageCompression from 'browser-image-compression'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  // Form fields
  const [companyName, setCompanyName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [taxId, setTaxId] = useState('')
  const [defaultTaxRate, setDefaultTaxRate] = useState(0)
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('Net 30')
  const [invoicePrefix, setInvoicePrefix] = useState('INV-')
  const [companyLogo, setCompanyLogo] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
      setCompanyName(data.company_name || '')
      setAddress(data.address || '')
      setPhone(data.phone || '')
      setBusinessEmail(data.business_email || '')
      setLicenseNumber(data.license_number || '')
      setTaxId(data.tax_id || '')
      setDefaultTaxRate(data.default_tax_rate || 0)
      setDefaultPaymentTerms(data.default_payment_terms || 'Net 30')
      setInvoicePrefix(data.invoice_prefix || 'INV-')
      setCompanyLogo(data.company_logo || '')
    }
    setLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 500,
        useWebWorker: true
      })

      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error compressing logo:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: companyName,
          address,
          phone,
          business_email: businessEmail,
          license_number: licenseNumber,
          tax_id: taxId,
          default_tax_rate: defaultTaxRate,
          default_payment_terms: defaultPaymentTerms,
          invoice_prefix: invoicePrefix,
          company_logo: companyLogo
        })
        .eq('id', session.user.id)

      if (error) throw error
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
        })
      })

      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Subscription Status */}
        {profile && (
          <section className="bg-white rounded-lg p-6 shadow-sm border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className={`w-5 h-5 ${profile.subscription_status === 'active' ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {profile.subscription_status === 'active' ? 'Pro Plan' : 'Free Plan'}
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  {profile.subscription_status === 'free'
                    ? `${profile.documents_used_this_month || 0}/5 documents used this month`
                    : 'Unlimited documents'}
                </p>
              </div>
              {profile.subscription_status === 'free' && (
                <button
                  onClick={handleUpgrade}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade to Pro
                </button>
              )}
            </div>
          </section>
        )}

        {/* Company Profile */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <div className="flex items-center gap-4">
                {companyLogo && (
                  <img src={companyLogo} alt="Logo" className="w-20 h-20 object-contain rounded border" />
                )}
                <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100">
                  <Camera className="w-5 h-5 inline mr-2" />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Document Defaults */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Defaults</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Payment Terms</label>
              <select
                value={defaultPaymentTerms}
                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="INV-"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
