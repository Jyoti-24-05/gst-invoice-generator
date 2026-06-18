import { useState } from 'react'
import LineItems from './LineItems'
import InvoicePreview from './InvoicePreview'
import Footer from './Footer'
import {
  calculateTotals,
  generateInvoiceNumber,
  INDIAN_STATES, validateForm 
} from '../utils/gstCalculations'
import axios from 'axios'
import { exportInvoicePDF } from '../utils/exportPDF'

const defaultForm = {
  invoiceNumber: generateInvoiceNumber(),
  invoiceDate: new Date().toISOString().split('T')[0],
  sellerName: '',
  sellerGSTIN: '',
  sellerAddress: '',
  sellerState: 'Jharkhand',
  buyerName: '',
  buyerGSTIN: '',
  buyerAddress: '',
  buyerState: 'Jharkhand',
  isInterState: false,
  lineItems: [
    { description: '', quantity: 1, rate: 0, gstRate: 18 }
  ]
}

export default function InvoiceForm() {
  const [form, setForm] = useState(defaultForm)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [exporting, setExporting] = useState(false)

  const { calculated, subTotal, totalCGST, totalSGST, totalIGST, grandTotal } =
    calculateTotals(form.lineItems, form.isInterState)

  const invoiceData = {
    ...form,
    lineItems: calculated,
    subTotal,
    totalCGST,
    totalSGST,
    totalIGST,
    grandTotal
  }

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-detect inter-state
      if (field === 'sellerState' || field === 'buyerState') {
        updated.isInterState = updated.sellerState !== updated.buyerState
      }
      return updated
    })
  }

  const handleSave = async () => {
  const validationErrors = validateForm(form)
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    setSavedMessage('Please fix the errors before saving.')
    return
  }
  setErrors({})
  setSaving(true)
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/invoices`, invoiceData)
    setSavedMessage('Invoice saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  } catch (err) {
    setSavedMessage('Error saving invoice. Please try again.')
  } finally {
    setSaving(false)
  }
}
  const handleReset = () => {
    setForm({ ...defaultForm, invoiceNumber: generateInvoiceNumber() })
    setShowPreview(false)
  }

const handleExportPDF = async () => {
  const validationErrors = validateForm(form)
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    setSavedMessage('Please fix errors before exporting.')
    return
  }
  setErrors({})
  setExporting(true)
  await exportInvoicePDF(form.invoiceNumber, invoiceData)
  setExporting(false)
}

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
<div className="mb-8 text-center">
  <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5 mb-3">
    <span className="text-purple-400 text-sm"></span>
    <span className="text-purple-500 text-xs font-medium tracking-wide uppercase">Free GST Tool</span>
    <span className="text-purple-400 text-sm"></span>
  </div>
  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
    GST Invoice Generator
  </h1>
  <p className="text-gray-400 mt-2 text-sm">
    Create, preview & download professional GST invoices: completely free
  </p>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-purple-50 p-6">
          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Number</label>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={e => handleChange('invoiceNumber', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
              <input
                type="date"
                value={form.invoiceDate}
                onChange={e => handleChange('invoiceDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Seller Details */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-purple-100">
              Seller Details
            </h2>
            <div className="space-y-3">
  {[
  { label: 'Business Name', field: 'sellerName', placeholder: 'Your business name' },
  { label: 'GSTIN', field: 'sellerGSTIN', placeholder: '22AAAAA0000A1Z5' },
  { label: 'Address', field: 'sellerAddress', placeholder: 'Full address' },
].map(({ label, field, placeholder }) => (
  <div key={field}>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={form[field]}
      onChange={e => {
        handleChange(field, e.target.value)
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
      }}
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
        errors[field]
          ? 'border-red-400 focus:ring-red-200'
          : 'border-gray-200 focus:ring-indigo-300'
      }`}
    />
    {errors[field] && (
      <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
    )}
  </div>
))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                <select
                  value={form.sellerState}
                  onChange={e => handleChange('sellerState', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-purple-100">
              Buyer Details
            </h2>
            <div className="space-y-3">
  {[
  { label: 'Buyer Name', field: 'buyerName', placeholder: 'Client / company name' },
  { label: 'GSTIN (optional)', field: 'buyerGSTIN', placeholder: '22AAAAA0000A1Z5' },
  { label: 'Address', field: 'buyerAddress', placeholder: 'Full address' },
].map(({ label, field, placeholder }) => (
  <div key={field}>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={form[field]}
      onChange={e => {
        handleChange(field, e.target.value)
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
      }}
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
        errors[field]
          ? 'border-red-400 focus:ring-red-200'
          : 'border-gray-200 focus:ring-indigo-300'
      }`}
    />
    {errors[field] && (
      <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
    )}
  </div>
))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                <select
                  value={form.buyerState}
                  onChange={e => handleChange('buyerState', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tax Type Badge */}
          <div className={`text-xs font-medium px-4 py-2 rounded-full mb-4 inline-flex items-center gap-2 ${
  form.isInterState
    ? 'bg-amber-50 text-amber-600 border border-amber-100'
    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
}`}>
            {form.isInterState
              ? 'Inter-State Supply — IGST applicable'
              : 'Intra-State Supply — CGST + SGST applicable'}
          </div>

          {/* Line Items */}
          <LineItems
            items={form.lineItems}
            onChange={items => handleChange('lineItems', items)}
          />
          {/* Validation Errors */}
{Object.keys(errors).length > 0 && (
  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 space-y-1">
    {Object.values(errors).map((err, i) => (
      <p key={i}>• {err}</p>
    ))}
  </div>
)}

          {/* Totals Summary */}
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-sm space-y-1.5 border border-purple-50">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subTotal.toFixed(2)}</span>
            </div>
            {form.isInterState ? (
              <div className="flex justify-between text-gray-600">
                <span>IGST</span>
                <span>₹{totalIGST.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>CGST</span>
                  <span>₹{totalCGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST</span>
                  <span>₹{totalSGST.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-purple-700 text-base border-t border-purple-100 pt-2 mt-2">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
{/* Action Buttons */}
<div className="mt-6 grid grid-cols-2 gap-3">
  <button
    onClick={() => {
      const validationErrors = validateForm(form)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
      setErrors({})
      setShowPreview(true)
    }}
    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-2xl transition text-sm shadow-sm shadow-purple-100"
  >
     Preview
  </button>

  <button
    onClick={handleExportPDF}
    disabled={exporting}
    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-2xl transition text-sm shadow-sm shadow-purple-100"
  >
    {exporting ? (
      <>
        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Exporting...
      </>
    ) : ' Download PDF'}
  </button>

  <button
    onClick={handleSave}
    disabled={saving}
    className="bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-400 hover:text-gray-600 font-medium py-3 rounded-2xl transition text-sm"
  >
    {saving ? 'Saving...' : ' Save Invoice'}
  </button>

  <button
    onClick={handleReset}
    className="bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-400 hover:text-gray-600 font-medium py-3 rounded-2xl transition text-sm"
  >
     Reset
  </button>
</div>
          {savedMessage && (
            <p className={`mt-3 text-sm text-center font-medium ${
              savedMessage.includes('Error') ? 'text-red-500' : 'text-green-600'
            }`}>
              {savedMessage}
            </p>
          )}
        </div>

        {/* RIGHT — Live Preview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-50 p-6">
          <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-pink-100">
          Live Preview
          </h2>
          <InvoicePreview data={invoiceData} />
        </div>

      </div>

      <Footer />
    </div>
  )
}