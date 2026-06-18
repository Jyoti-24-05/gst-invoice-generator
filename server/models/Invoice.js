import mongoose from 'mongoose'

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  gstRate: { type: Number, required: true }, // 0, 5, 12, 18, 28
  amount: { type: Number, required: true },   // qty * rate
  cgst: { type: Number },
  sgst: { type: Number },
  igst: { type: Number },
  totalAmount: { type: Number, required: true }
})

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, required: true },
  
  // Seller details
  sellerName: { type: String, required: true },
  sellerGSTIN: { type: String, required: true },
  sellerAddress: { type: String, required: true },
  sellerState: { type: String, required: true },

  // Buyer details
  buyerName: { type: String, required: true },
  buyerGSTIN: { type: String },
  buyerAddress: { type: String, required: true },
  buyerState: { type: String, required: true },

  // Line items
  lineItems: [lineItemSchema],

  // Tax type — if same state = CGST+SGST, different state = IGST
  isInterState: { type: Boolean, default: false },

  // Totals
  subTotal: { type: Number, required: true },
  totalCGST: { type: Number },
  totalSGST: { type: Number },
  totalIGST: { type: Number },
  grandTotal: { type: Number, required: true },

}, { timestamps: true })

export default mongoose.model('Invoice', invoiceSchema)