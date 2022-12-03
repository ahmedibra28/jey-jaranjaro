import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'
import { deleteFile } from '../../../utils/fileManager'

const handler = nc()
handler.use(isAuth)

handler.put(async (req, res) => {
  await dbConnect()

  const { fullName, mobileNumber, inputFields } = req.body
  const orderItems = JSON.parse(inputFields)
  const _id = req.query.id

  if (orderItems && orderItems.length < 1) {
    return res.status(400).send('Please add items in this order')
  }

  const obj = await Order.findById(_id)

  if (obj) {
    obj.fullName = fullName
    obj.mobileNumber = mobileNumber
    obj.orderItems = orderItems

    const updateObj = await obj.save()
    if (updateObj) {
      res.status(200).json({ status: 'success' })
    }
  } else {
    return res.status(404).send('Order not found')
  }
})

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id

  const obj = await Order.findById(_id)
  if (!obj) {
    return res.status(404).send('Order not found')
  } else {
    if (obj.files.length > 0) {
      obj.files.map((file) => {
        return deleteFile({
          pathName: file.fullFileName,
        })
      })
    }
    await obj.remove()
    res.json({ status: 'success' })
  }
})

export default handler
