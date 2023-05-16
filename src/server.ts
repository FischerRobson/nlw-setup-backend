import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const app = fastify()
const prisma = new PrismaClient()

app.get('/hello', async (req, res) => {
  return await prisma.user.findMany()
})

app.listen({ port: 3333 }).then(() => {
  console.log('listening on port 3333')
})
