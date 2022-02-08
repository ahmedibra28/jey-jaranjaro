import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Expense from '../../../models/Expense'
import { isAuth } from '../../../utils/auth'

const handler = nc()
handler.use(isAuth)

handler.put(async (req, res) => {
  await dbConnect()

  const { name, description, expense } = req.body

  const _id = req.query.id

  const obj = await Expense.findById(_id)

  if (obj) {
    obj.name = name
    obj.description = description
    obj.expense = expense
    await obj.save()

    res.json({ status: 'success' })
  } else {
    return res.status(404).send('Expense not found')
  }
})

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id
  const obj = await Expense.findById(_id)
  if (!obj) {
    return res.status(404).send('Expense not found')
  } else {
    await obj.remove()

    res.json({ status: 'success' })
  }
})

export default handler
