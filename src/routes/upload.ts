import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (req, res) => {
    const upload = await req.file({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })

    if (!upload) {
      return res.status(400).send()
    }

    const mimetypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFormat = mimetypeRegex.test(upload.mimetype)

    if (!isValidFormat) {
      return res.status(415).send()
    }

    const fileId = randomUUID()
    const extension = extname(upload.filename)

    const fileName = fileId.concat(extension)

    const writeSteam = createWriteStream(
      resolve(__dirname, '../../uploads', fileName),
    )

    await pump(upload.file, writeSteam)

    const fullUrl = req.protocol.concat('://').concat(req.hostname)
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return { fileUrl }
  })
}
