import './dotenv/config'

import fastify from 'fastify'
import { memoriesRoutes } from './routes/memories'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth'

import jwt from '@fastify/jwt'
const app = fastify()

app.register(cors, {
  origin: ['http://localhost:3000'],
})
app.register(jwt, {
  secret: 'spacetime',
})

app.register(memoriesRoutes)
app.register(authRoutes)

app.listen({ port: 3333 }).then(() => {
  console.log('listening on port 3333')
})
