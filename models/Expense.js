import mongoose from 'mongoose'

const expenseScheme = mongoose.Schema(
  {
    name: String,
    description: String,
    expense: Number,
  },
  { timestamps: true }
)

const Expense =
  mongoose.models.Expense || mongoose.model('Expense', expenseScheme)
export default Expense
