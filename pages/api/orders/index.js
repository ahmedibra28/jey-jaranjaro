import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'

import fileUpload from 'express-fileupload'
import { upload } from '../../../utils/fileManager'
export const config = { api: { bodyParser: false } }

const handler = nc()
handler.use(fileUpload())

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

  const { fullName, mobileNumber, inputFields } = req.body
  const orderItems = JSON.parse(inputFields)
  const user = req.user.id
  const files = req.files
    ? (!Array.isArray(req.files.file) && [req.files.file]) || req.files.file
    : []

  if (orderItems && orderItems.length < 1) {
    return res.status(400).send('Please add items in this order')
  }

  try {
    const uploadFiles = (files) => {
      const promises = files.map((file) => {
        return upload({
          fileName: file,
          fileType: 'image',
          pathName: 'designs',
        })
      })
      return Promise.all(promises)
    }

    if (files.length > 0) {
      const uploadedFiles = await uploadFiles(files)

      const createObj = await Order.create({
        orderItems,
        fullName,
        mobileNumber,
        user,
        files: uploadedFiles,
      })
      if (createObj) {
        res.send(createObj)
      }
    } else {
      const createObj = await Order.create({
        orderItems,
        fullName,
        mobileNumber,
        user,
      })
      if (createObj) {
        res.send(createObj)
      }
    }
  } catch (error) {
    res.status(500).send(error && error.message ? error.message : error)
  }
})

export default handler
