import mongoose from 'mongoose'
import Order from './Order'
import User from './User'

const transactionScheme = mongoose.Schema(
  {
    receiptBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: Order, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: Number, required: true },
    prevAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
  },
  { timestamps: true }
)

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model('Transaction', transactionScheme)
export default Transaction
