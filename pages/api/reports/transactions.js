import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Transaction from '../../../models/Transaction'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()

  const order = req.body

  const transaction = await Transaction.find({ order })
    .populate('receiptBy', 'name')
    .populate('order')
    .sort({ createdAt: -1 })
  if (transaction.length > 0) {
    res.status(200).send(transaction)
  } else {
    res.status(400).send('You have not receipt any money from this order yet')
  }
})

export default handler
