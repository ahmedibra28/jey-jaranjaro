import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()
  const mobileNumber = req.query && req.query.search

  let query = Order.find(mobileNumber ? { mobileNumber } : {})
  const total = await Order.countDocuments(mobileNumber ? { mobileNumber } : {})

  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.limit) || 50
  const skip = (page - 1) * pageSize

  const pages = Math.ceil(total / pageSize)

  query = query
    .skip(skip)
    .lean()
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .populate('user', ['name'])

  const result = await query

  res.send({
    startIndex: skip + 1,
    endIndex: skip + result.length,
    count: result.length,
    page,
    pages,
    total,
    data: result,
  })
})

handler.post(async (req, res) => {
  await dbConnect()

  const { fullName, mobileNumber } = req.body.data

  const { inputFields: orderItems } = req.body
  const user = req.user.id

  if (orderItems && orderItems.length < 1) {
    return res.status(400).send('Please add items in this order')
  }

  const createObj = await Order.create({
    orderItems,
    fullName,
    mobileNumber,
    user,
  })

  if (createObj) {
    res.status(201).json({ status: 'success' })
  } else {
    return res.status(400).send('Invalid data')
  }
})

export default handler
