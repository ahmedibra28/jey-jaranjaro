import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'
import Transaction from '../../../models/Transaction'

const handler = nc()

handler.use(isAuth)

handler.post(async (req, res) => {
  await dbConnect()
  const { q: mobileNumber } = req.query

  const obj = await Order.find({
    mobileNumber,
  }).populate('user', 'name')

  const trans = await Transaction.find(
    { customerMobile: mobileNumber },
    {},
    { sort: { createdAt: -1 } }
  ).lean()

  const objOrders = obj.map((o) => ({
    _id: o._id,
    fullName: o.fullName,
    mobileNumber: o.mobileNumber,
    createdAt: o.createdAt,
    cost: o.orderItems.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    ),
    items: o.orderItems.length,
  }))

  res.status(200).send({ orders: objOrders, transactions: trans })
})

handler.put(async (req, res) => {
  await dbConnect()
  const {
    _id,
    data: { receipt, discount, commission },
  } = req.body

  const obj = await Order.findById(_id)
  if (obj) {
    const balance = obj.orderItems.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    )

    const transactions = await Transaction.find({ order: _id })
    const transBalance = transactions.reduce(
      (acc, curr) =>
        acc + curr.paidAmount + curr.discountAmount + curr.commissionAmount,
      0
    )

    const total = Number(discount) + Number(receipt) + Number(commission)

    if (balance - transBalance < total) {
      res
        .status(400)
        .send(
          `Your can not receipt more than $${(balance - transBalance).toFixed(
            2
          )} for ${obj.fullName}`
        )
      return
    }

    await Transaction.create({
      paidAmount: receipt,
      discountAmount: discount,
      commissionAmount: commission,
      order: _id,
      customerName: obj.fullName,
      customerMobile: obj.mobileNumber,
      receiptBy: req.user.id,
    })
    res.status(200).send('success')
  }
})
export default handler
