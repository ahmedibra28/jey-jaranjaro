import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import User from '../../../models/User'
import UserLogon from '../../../models/UserLogon'
import { generateToken } from '../../../utils/auth'

const handler = nc()

handler.post(async (req, res) => {
  try {
    await dbConnect()

    const email = req.body.email.toLowerCase()
    const password = req.body.password

    const user = await User.findOne({ email })
    if (user && (await user.matchPassword(password))) {
      await UserLogon.create({
        user: user._id,
      })

      return res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        group: user.group,
        token: generateToken(user._id),
      })
    } else {
      return res.status(401).send('Invalid email or password')
    }
  } catch (error) {
    return res.status(401).json(error?.message)
  }
})

export default handler
