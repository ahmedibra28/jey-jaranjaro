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

  const trans = await Transaction.findOne(
    { customerMobile: mobileNumber },
    {},
    { sort: { createdAt: -1 } }
  ).lean()
  if (trans) {
    if (trans.prevAmount <= trans.paidAmount + trans.discountAmount) {
      return res
        .status(400)
        .send(
          `There is no balance to receipt for this ${mobileNumber} customer`
        )
    }
  }
  res.status(200).send(obj)
})

handler.put(async (req, res) => {
  await dbConnect()
  const {
    _id,
    data: { receipt, discount },
  } = req.body

  const obj = await Order.findById(_id)
  if (obj) {
    const prevOrder = await Order.find({ mobileNumber: obj.mobileNumber })
    const prevOrderArray = prevOrder.map((prev) =>
      prev.orderItems.reduce((acc, cur) => acc + cur.quantity * cur.price, 0)
    )
    const prevTotalOrderMoney = prevOrderArray.reduce(
      (acc, curr) => acc + curr,
      0
    )

    const prevTrans = await Transaction.find({
      customerMobile: obj.mobileNumber,
    })
    if (prevTrans && prevTrans.length > 0) {
      // let prevTransBalanceAmount = 0
      let prevTransPaidAmount = 0
      let prevTransDiscountAmount = 0

      prevTrans.forEach((prev) => {
        // prevTransBalanceAmount += prev.prevAmount
        prevTransPaidAmount += prev.paidAmount
        prevTransDiscountAmount += prev.discountAmount
      })

      const currBalanceAmount =
        prevTotalOrderMoney - (prevTransPaidAmount + prevTransDiscountAmount)
      const currPaidAmount = receipt
      const currDiscountAmount = discount

      const newTransObj = {
        prevAmount: currBalanceAmount,
        paidAmount: currPaidAmount,
        discountAmount: currDiscountAmount,
        order: _id,
        customerName: obj.fullName,
        customerMobile: obj.mobileNumber,
        receiptBy: req.user.id,
      }

      if (currBalanceAmount < Number(receipt) + Number(discount)) {
        res
          .status(400)
          .send(
            `Your can not receipt more than $${currBalanceAmount.toFixed(
              2
            )} for ${obj.fullName}`
          )
        return
      }

      await Transaction.create(newTransObj)
    } else {
      const currBalanceAmount = prevTotalOrderMoney
      const currPaidAmount = receipt
      const currDiscountAmount = discount

      const newTransObj = {
        prevAmount: currBalanceAmount,
        paidAmount: currPaidAmount,
        discountAmount: currDiscountAmount,
        order: _id,
        customerName: obj.fullName,
        customerMobile: obj.mobileNumber,
        receiptBy: req.user.id,
      }

      await Transaction.create(newTransObj)
    }
    res.status(200).send('Done')
  }
})
export default handler
