import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

handler.use(isAuth)

handler.get(async (req, res) => {
  await dbConnect()
  const _id = req.query.id
  const obj = await Order.findById(_id).populate('user', 'name')
  res.status(200).send(obj)
})

export default handler
