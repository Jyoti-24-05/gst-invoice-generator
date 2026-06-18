import express from 'express'
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  deleteInvoice
} from '../controllers/invoiceController.js'

const router = express.Router()

router.post('/', createInvoice)
router.get('/', getAllInvoices)
router.get('/:id', getInvoiceById)
router.delete('/:id', deleteInvoice)

export default router