import { formatCurrency, numberToWords } from '../utils/gstCalculations'

export default function InvoicePreview({ data }) {
  const {
    invoiceNumber, invoiceDate,
    sellerName, sellerGSTIN, sellerAddress, sellerState,
    buyerName, buyerGSTIN, buyerAddress, buyerState,
    lineItems, isInterState,
    subTotal, totalCGST, totalSGST, totalIGST, grandTotal
  } = data

  const formattedDate = invoiceDate
    ? new Date(invoiceDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '—'

  return (
    <div
      id="invoice-preview"
      className="bg-white border border-gray-200 rounded-xl p-6 text-xs text-gray-800 font-sans"
      style={{ minHeight: '600px' }}
    >

      {/* ── Header ── */}
      <div className="flex justify-between items-start border-b-2 border-purple-200 pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          TAX INVOICE
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Original for Recipient</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-base text-gray-800">
            {sellerName || <span className="text-gray-300">Your Business Name</span>}
          </p>
          <p className="text-gray-500 mt-0.5">
            GSTIN: {sellerGSTIN || <span className="text-gray-300">—</span>}
          </p>
          <p className="text-gray-500 max-w-[180px] text-right leading-relaxed">
            {sellerAddress || <span className="text-gray-300">Your Address</span>}
          </p>
          <p className="text-gray-500">{sellerState}</p>
        </div>
      </div>

      {/* ── Invoice Meta + Buyer ── */}
      <div className="grid grid-cols-2 gap-4 mb-5">

        {/* Invoice details */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <p className="font-semibold text-gray-600 text-xs uppercase tracking-wide mb-2">
            Invoice Details
          </p>
          <div className="flex justify-between">
            <span className="text-gray-400">Invoice No.</span>
            <span className="font-medium">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Supply Type</span>
            <span className={`font-semibold ${isInterState ? 'text-orange-500' : 'text-green-600'}`}>
              {isInterState ? 'Inter-State' : 'Intra-State'}
            </span>
          </div>
        </div>

        {/* Buyer details */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <p className="font-semibold text-gray-600 text-xs uppercase tracking-wide mb-2">
            Bill To
          </p>
          <p className="font-bold text-gray-800">
            {buyerName || <span className="text-gray-300">Buyer Name</span>}
          </p>
          {buyerGSTIN && (
            <p className="text-gray-500">GSTIN: {buyerGSTIN}</p>
          )}
          <p className="text-gray-500 leading-relaxed">
            {buyerAddress || <span className="text-gray-300">Buyer Address</span>}
          </p>
          <p className="text-gray-500">{buyerState}</p>
        </div>

      </div>

      {/* ── Line Items Table ── */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gradient-to-r from-purple-500 to-pink-400 text-white">
            <th className="p-2 text-left rounded-tl-lg">#</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-center">Qty</th>
            <th className="p-2 text-center">Rate</th>
            <th className="p-2 text-center">GST%</th>
            {isInterState ? (
              <th className="p-2 text-center">IGST</th>
            ) : (
              <>
                <th className="p-2 text-center">CGST</th>
                <th className="p-2 text-center">SGST</th>
              </>
            )}
            <th className="p-2 text-right rounded-tr-lg">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems && lineItems.length > 0 ? (
            lineItems.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="p-2 text-gray-400">{i + 1}</td>
                <td className="p-2 font-medium text-gray-700">
                  {item.description || <span className="text-gray-300 italic">—</span>}
                </td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-center">{formatCurrency(item.rate)}</td>
                <td className="p-2 text-center">{item.gstRate}%</td>
                {isInterState ? (
                  <td className="p-2 text-center">{formatCurrency(item.igst)}</td>
                ) : (
                  <>
                    <td className="p-2 text-center">{formatCurrency(item.cgst)}</td>
                    <td className="p-2 text-center">{formatCurrency(item.sgst)}</td>
                  </>
                )}
                <td className="p-2 text-right font-semibold">
                  {formatCurrency(item.totalAmount)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={isInterState ? 7 : 8}
                className="p-4 text-center text-gray-300 italic"
              >
                No items added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div className="flex justify-end mb-5">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subTotal)}</span>
          </div>

          {isInterState ? (
            <div className="flex justify-between text-gray-500">
              <span>IGST</span>
              <span>{formatCurrency(totalIGST)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-gray-500">
                <span>CGST</span>
                <span>{formatCurrency(totalCGST)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SGST</span>
                <span>{formatCurrency(totalSGST)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between font-bold text-purple-700 text-sm border-t-2 border-purple-200 pt-2 mt-2">
            <span>Grand Total</span>
            <span className="text-purple-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* ── Amount in Words ── */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-3 mb-5">
        <span className="text-gray-400 mr-2">Amount in Words:</span>
        <span className="font-semibold text-purple-700 italic">
          {numberToWords(grandTotal)}
        </span>
      </div>

      {/* ── Tax Summary Table ── */}
      <div className="mb-5">
        <p className="font-semibold text-gray-600 uppercase tracking-wide text-xs mb-2">
          Tax Summary
        </p>
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="p-2 text-left">GST Rate</th>
              <th className="p-2 text-center">Taxable Amount</th>
              {isInterState ? (
                <th className="p-2 text-center">IGST</th>
              ) : (
                <>
                  <th className="p-2 text-center">CGST</th>
                  <th className="p-2 text-center">SGST</th>
                </>
              )}
              <th className="p-2 text-right">Total Tax</th>
            </tr>
          </thead>
          <tbody>
            {/* Group by GST rate */}
            {[0, 5, 12, 18, 28].map(rate => {
              const group = lineItems?.filter(i => i.gstRate === rate) || []
              if (group.length === 0) return null
              const taxable = group.reduce((s, i) => s + (i.amount || 0), 0)
              const cgst = group.reduce((s, i) => s + (i.cgst || 0), 0)
              const sgst = group.reduce((s, i) => s + (i.sgst || 0), 0)
              const igst = group.reduce((s, i) => s + (i.igst || 0), 0)
              const totalTax = isInterState ? igst : cgst + sgst
              return (
                <tr key={rate} className="border-t border-gray-100">
                  <td className="p-2">{rate}%</td>
                  <td className="p-2 text-center">{formatCurrency(taxable)}</td>
                  {isInterState ? (
                    <td className="p-2 text-center">{formatCurrency(igst)}</td>
                  ) : (
                    <>
                      <td className="p-2 text-center">{formatCurrency(cgst)}</td>
                      <td className="p-2 text-center">{formatCurrency(sgst)}</td>
                    </>
                  )}
                  <td className="p-2 text-right font-semibold">{formatCurrency(totalTax)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-between items-end border-t border-gray-200 pt-4 mt-4">
        <div>
          <p className="text-gray-400 text-xs">
            This is a computer-generated invoice and does not require a physical signature.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Generated by GST Invoice Generator
          </p>
        </div>
        <div className="text-right">
          <div className="border-t border-gray-400 w-32 mb-1" />
          <p className="text-gray-500">Authorised Signatory</p>
          <p className="font-semibold text-gray-700">{sellerName || '—'}</p>
        </div>
      </div>

    </div>
  )
}