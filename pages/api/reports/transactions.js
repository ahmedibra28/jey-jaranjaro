import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Transaction from '../../../models/Transaction'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.post(async (req, res) => {
  await dbConnect()
  const customerMobile = req.body

  let query = Transaction.find(customerMobile ? { customerMobile } : {})
  const total = await Transaction.countDocuments(
    customerMobile ? { customerMobile } : {}
  )
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.limit) || 50
  const skip = (page - 1) * pageSize

  const pages = Math.ceil(total / pageSize)

  query = query.skip(skip).limit(pageSize).populate('receiptBy', ['name'])
  const result = await query

  res.status(200).send({
    startIndex: skip + 1,
    endIndex: skip + result.length,
    count: result.length,
    page,
    pages,
    total,
    data: result,
  })
})

export default handler
