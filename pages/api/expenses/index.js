import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Expense from '../../../models/Expense'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.get(async (req, res) => {
  await dbConnect()

  const obj = await Expense.find({}).sort({ createdAt: -1 })

  res.send(obj)
})

handler.post(async (req, res) => {
  await dbConnect()

  const { name, description, expense } = req.body

  const createObj = await Expense.create({
    name,
    description,
    expense,
  })

  if (createObj) {
    res.status(201).json({ status: 'success' })
  } else {
    return res.status(400).send('Invalid data')
  }
})

export default handler
