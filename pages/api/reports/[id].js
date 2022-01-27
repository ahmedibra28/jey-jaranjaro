import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Transaction from '../../../models/Transaction'
import { isAuth } from '../../../utils/auth'

const handler = nc()
handler.use(isAuth)

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id
  const obj = await Transaction.findById(_id)
  if (!obj) {
    return res.status(404).send('Transaction not found')
  } else {
    await obj.remove()

    res.json({ status: 'success' })
  }
})

export default handler
