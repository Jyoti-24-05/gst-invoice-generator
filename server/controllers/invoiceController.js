import Invoice from '../models/Invoice.js'

// Save invoice to DB
export const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body)
    const saved = await invoice.save()
    res.status(201).json({ success: true, data: saved })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

// Get all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: invoices })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get single invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' })
    res.status(200).json({ success: true, data: invoice })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Invoice deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}