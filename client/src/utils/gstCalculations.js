export const GST_RATES = [0, 5, 12, 18, 28]

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
  'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
]

// ─── Core Calculation ─────────────────────────────────────────────────────────

export const calculateLineItem = (item, isInterState) => {
  const quantity = parseFloat(item.quantity) || 0
  const rate = parseFloat(item.rate) || 0
  const gstRate = parseFloat(item.gstRate) || 0

  const amount = parseFloat((quantity * rate).toFixed(2))
  const gstAmount = parseFloat(((amount * gstRate) / 100).toFixed(2))

  if (isInterState) {
    return {
      ...item,
      quantity,
      rate,
      gstRate,
      amount,
      igst: gstAmount,
      cgst: 0,
      sgst: 0,
      totalAmount: parseFloat((amount + gstAmount).toFixed(2))
    }
  }

  const halfGST = parseFloat((gstAmount / 2).toFixed(2))

  return {
    ...item,
    quantity,
    rate,
    gstRate,
    amount,
    cgst: halfGST,
    sgst: halfGST,
    igst: 0,
    totalAmount: parseFloat((amount + halfGST + halfGST).toFixed(2))
  }
}

export const calculateTotals = (lineItems, isInterState) => {
  const calculated = lineItems.map(item => calculateLineItem(item, isInterState))

  const subTotal = parseFloat(
    calculated.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
  )
  const totalCGST = parseFloat(
    calculated.reduce((sum, item) => sum + (item.cgst || 0), 0).toFixed(2)
  )
  const totalSGST = parseFloat(
    calculated.reduce((sum, item) => sum + (item.sgst || 0), 0).toFixed(2)
  )
  const totalIGST = parseFloat(
    calculated.reduce((sum, item) => sum + (item.igst || 0), 0).toFixed(2)
  )
  const grandTotal = parseFloat(
    (subTotal + totalCGST + totalSGST + totalIGST).toFixed(2)
  )

  return { calculated, subTotal, totalCGST, totalSGST, totalIGST, grandTotal }
}

// ─── Invoice Number Generator ─────────────────────────────────────────────────

export const generateInvoiceNumber = () => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `INV-${year}${month}-${random}`
}

// ─── Currency Formatter ───────────────────────────────────────────────────────

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0)
}

// ─── Number to Words (for invoice footer) ────────────────────────────────────

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
]
const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety'
]

const convertHundreds = (n) => {
  if (n === 0) return ''
  if (n < 20) return ones[n] + ' '
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' '
  return ones[Math.floor(n / 100)] + ' Hundred ' + convertHundreds(n % 100)
}

export const numberToWords = (amount) => {
  if (!amount || amount === 0) return 'Zero Rupees Only'

  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)

  let result = ''

  if (rupees >= 10000000) {
    result += convertHundreds(Math.floor(rupees / 10000000)) + 'Crore '
  }
  if (rupees >= 100000) {
    result += convertHundreds(Math.floor((rupees % 10000000) / 100000)) + 'Lakh '
  }
  if (rupees >= 1000) {
    result += convertHundreds(Math.floor((rupees % 100000) / 1000)) + 'Thousand '
  }
  if (rupees >= 100) {
    result += convertHundreds(Math.floor((rupees % 1000) / 100)) + 'Hundred '
  }
  result += convertHundreds(rupees % 100)

  let words = result.trim() + ' Rupees'
  if (paise > 0) {
    words += ' and ' + convertHundreds(paise).trim() + ' Paise'
  }
  words += ' Only'

  return words.replace(/\s+/g, ' ').trim()
}

// ─── GSTIN Validator ──────────────────────────────────────────────────────────

export const validateGSTIN = (gstin) => {
  if (!gstin) return true // optional for buyer
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin.toUpperCase())
}

// ─── Form Validator ───────────────────────────────────────────────────────────

export const validateForm = (form) => {
  const errors = {}

  if (!form.sellerName.trim()) errors.sellerName = 'Seller name is required'
  if (!form.sellerGSTIN.trim()) {
    errors.sellerGSTIN = 'Seller GSTIN is required'
  } else if (!validateGSTIN(form.sellerGSTIN)) {
    errors.sellerGSTIN = 'Invalid GSTIN format'
  }
  if (!form.sellerAddress.trim()) errors.sellerAddress = 'Seller address is required'

  if (!form.buyerName.trim()) errors.buyerName = 'Buyer name is required'
  if (!form.buyerAddress.trim()) errors.buyerAddress = 'Buyer address is required'
  if (form.buyerGSTIN && !validateGSTIN(form.buyerGSTIN)) {
    errors.buyerGSTIN = 'Invalid GSTIN format'
  }

  const hasEmptyItem = form.lineItems.some(
    item => !item.description.trim() || item.quantity <= 0 || item.rate <= 0
  )
  if (hasEmptyItem) errors.lineItems = 'All line items must have description, quantity and rate'

  return errors
}