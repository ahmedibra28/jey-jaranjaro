import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)

handler.post(async (req, res) => {
  await dbConnect()
  const { q: mobileNumber } = req.query

  const obj = await Order.find({
    mobileNumber,
  }).populate('user', 'name')

  res.status(200).send(obj)
})

export default handler
