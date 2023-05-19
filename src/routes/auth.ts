import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import axios from 'axios'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (req, res) => {
    const bodySchema = z.object({
      code: z.string(),
    })

    const { code } = bodySchema.parse(req.body)

    const accessTokenResponse = await axios.post(
      'https://github.com/auth/access_token',
      null,
      {
        params: {
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )

    const { access_token } = accessTokenResponse.data

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    const { id, login, name, avatar_url } = userSchema.parse(userResponse.data)

    let user = await prisma.user.findUnique({
      where: {
        githubId: id,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          login,
          avatarUrl: avatar_url,
          githubId: id,
        },
      })
    }

    const token = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '30 days',
      },
    )

    return {
      token,
    }
  })
}
