import mongoose from 'mongoose'
import User from './User'

const orderScheme = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
    fullName: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    orderItems: [
      {
        item: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
)

const Order = mongoose.models.Order || mongoose.model('Order', orderScheme)
export default Order
