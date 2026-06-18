import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ── Approach 1: html2canvas screenshot (high quality) ──────────────────────
const exportViaCanvas = async (invoiceNumber) => {
  const element = document.getElementById('invoice-preview')
  if (!element) throw new Error('Preview element not found')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    removeContainer: true,
    imageTimeout: 0,
    onclone: (clonedDoc) => {
      const el = clonedDoc.getElementById('invoice-preview')
      if (el) {
        el.style.width = '900px'
        el.style.padding = '32px'
        el.style.boxSizing = 'border-box'
      }
    }
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgHeight = (canvas.height * pdfWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
  heightLeft -= pdfHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight)
    heightLeft -= pdfHeight
  }

  pdf.save(`${invoiceNumber || 'invoice'}.pdf`)
  return true
}

// ── Approach 2: Pure jsPDF text fallback (always works) ────────────────────
const exportViaText = (data) => {
  const {
    invoiceNumber, invoiceDate,
    sellerName, sellerGSTIN, sellerAddress, sellerState,
    buyerName, buyerGSTIN, buyerAddress, buyerState,
    lineItems, isInterState,
    subTotal, totalCGST, totalSGST, totalIGST, grandTotal
  } = data

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = pdf.internal.pageSize.getWidth()
  let y = 15

  const line = () => {
    pdf.setDrawColor(200, 200, 200)
    pdf.line(15, y, W - 15, y)
    y += 4
  }

  const text = (str, x, size = 10, style = 'normal', color = [30, 30, 30]) => {
    pdf.setFontSize(size)
    pdf.setFont('helvetica', style)
    pdf.setTextColor(...color)
    pdf.text(String(str || '—'), x, y)
  }

  const row = (left, right, size = 10, bold = false) => {
    text(left, 15, size, bold ? 'bold' : 'normal')
    text(right, W - 15, size, bold ? 'bold' : 'normal')
    pdf.setFont('helvetica', 'normal')
    // right-align the right column
    const textW = pdf.getTextWidth(String(right))
    pdf.text(String(right || ''), W - 15 - textW, y)
    // overwrite with proper alignment
    pdf.setTextColor(30, 30, 30)
    y += 6
  }

  const fmt = (n) =>
    'Rs ' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  // ── Title
  pdf.setFillColor(67, 56, 202)
  pdf.rect(0, 0, W, 20, 'F')
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('TAX INVOICE', 15, 13)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Original for Recipient', W - 15 - pdf.getTextWidth('Original for Recipient'), 13)
  y = 28

  // ── Seller
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(30, 30, 30)
  pdf.text(sellerName || 'Seller Name', 15, y); y += 6
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  pdf.text(`GSTIN: ${sellerGSTIN || '—'}`, 15, y); y += 5
  pdf.text(sellerAddress || '—', 15, y); y += 5
  pdf.text(sellerState || '—', 15, y); y += 8
  line()

  // ── Invoice meta + Buyer side by side
  const col2 = W / 2 + 5
  const metaStartY = y

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(100, 100, 100)
  pdf.text('INVOICE DETAILS', 15, y)
  pdf.text('BILL TO', col2, y)
  y += 5

  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(30, 30, 30)
  pdf.setFontSize(9)

  const metaLines = [
    [`Invoice No: ${invoiceNumber}`, buyerName || '—'],
    [`Date: ${invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN') : '—'}`,
      `GSTIN: ${buyerGSTIN || 'N/A'}`],
    [`Type: ${isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}`,
      buyerAddress || '—'],
    ['', buyerState || '—']
  ]

  metaLines.forEach(([left, right]) => {
    pdf.text(left, 15, y)
    pdf.text(right, col2, y)
    y += 5
  })

  y += 4
  line()

  // ── Line Items Header
  pdf.setFillColor(240, 242, 255)
  pdf.rect(15, y - 2, W - 30, 8, 'F')
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(67, 56, 202)

  const cols = isInterState
    ? [15, 50, 95, 117, 135, 155, W - 15]
    : [15, 50, 95, 117, 135, 148, 161, W - 15]
  const headers = isInterState
    ? ['#', 'Description', 'Qty', 'Rate', 'GST%', 'IGST', 'Total']
    : ['#', 'Description', 'Qty', 'Rate', 'GST%', 'CGST', 'SGST', 'Total']

  headers.forEach((h, i) => { pdf.text(h, cols[i], y + 4) })
  y += 10

  // ── Line Items Rows
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(30, 30, 30)
  pdf.setFontSize(8)

  lineItems?.forEach((item, idx) => {
    if (y > 250) { pdf.addPage(); y = 20 }
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252)
      pdf.rect(15, y - 3, W - 30, 7, 'F')
    }
    const vals = isInterState
      ? [
          idx + 1,
          (item.description || '').slice(0, 28),
          item.quantity,
          fmt(item.rate),
          `${item.gstRate}%`,
          fmt(item.igst),
          fmt(item.totalAmount)
        ]
      : [
          idx + 1,
          (item.description || '').slice(0, 28),
          item.quantity,
          fmt(item.rate),
          `${item.gstRate}%`,
          fmt(item.cgst),
          fmt(item.sgst),
          fmt(item.totalAmount)
        ]

    vals.forEach((v, i) => { pdf.text(String(v), cols[i], y + 2) })
    y += 7
  })

  y += 3
  line()

  // ── Totals
  const totals = isInterState
    ? [
        ['Subtotal', fmt(subTotal)],
        ['IGST', fmt(totalIGST)],
        ['Grand Total', fmt(grandTotal)]
      ]
    : [
        ['Subtotal', fmt(subTotal)],
        ['CGST', fmt(totalCGST)],
        ['SGST', fmt(totalSGST)],
        ['Grand Total', fmt(grandTotal)]
      ]

  totals.forEach(([label, value], i) => {
    const isLast = i === totals.length - 1
    pdf.setFontSize(isLast ? 11 : 9)
    pdf.setFont('helvetica', isLast ? 'bold' : 'normal')
    pdf.setTextColor(isLast ? 67 : 100, isLast ? 56 : 100, isLast ? 202 : 100)
    pdf.text(label, W - 70, y)
    const vW = pdf.getTextWidth(value)
    pdf.text(value, W - 15 - vW, y)
    y += isLast ? 7 : 5
  })

  y += 4
  line()

  // ── Footer
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'italic')
  pdf.setTextColor(150, 150, 150)
  pdf.text('This is a computer-generated invoice.', 15, y); y += 5
  pdf.text('Generated by GST Invoice Generator', 15, y)

  const sig = `Authorised Signatory: ${sellerName || '—'}`
  pdf.text(sig, W - 15 - pdf.getTextWidth(sig), y)

  pdf.save(`${invoiceNumber || 'invoice'}.pdf`)
  return true
}

// ── Main export function — tries canvas first, falls back to text ───────────
export const exportInvoicePDF = async (invoiceNumber, invoiceData) => {
  try {
    await exportViaCanvas(invoiceNumber)
  } catch (err) {
    console.warn('Canvas export failed, using text fallback:', err.message)
    try {
      exportViaText(invoiceData)
    } catch (fallbackErr) {
      console.error('Both export methods failed:', fallbackErr)
      alert('Failed to export PDF. Please try again.')
    }
  }
}