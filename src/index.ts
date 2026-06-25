import { Hono } from 'hono'
import { createPrisma } from './db'
import { encodeCursor, decodeCursor } from './cursor'

type Bindings = {
  DATABASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /products?limit=20&category=Electronics&cursor=<token>
app.get('/products', async (c) => {
  const prisma = createPrisma(c.env.DATABASE_URL)

  const limit  = Math.min(Number(c.req.query('limit') ?? 20), 100)
  const category = c.req.query('category') ?? null
  const cursorToken = c.req.query('cursor') ?? null

  // Build WHERE clause
  const where: any = {}

  if (category) {
    where.category = category
  }

  if (cursorToken) {
    const cursor = decodeCursor(cursorToken)
    const cursorDate = new Date(cursor.createdAt)

    // Keyset: rows strictly older than cursor, OR same timestamp but lower id
    where.OR = [
      { createdAt: { lt: cursorDate } },
      {
        AND: [
          { createdAt: { equals: cursorDate } },
          { id: { lt: cursor.id } }
        ]
      }
    ]
  }

  const products = await prisma.products.findMany({
    where,
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' }
    ],
    take: limit,
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      createdAt: true,
      updatedAt: true
    }
  })

  const last = products[products.length - 1]
  const nextCursor = products.length === limit
    ? encodeCursor(last.createdAt, last.id)
    : null

  return c.json({
    products,
    nextCursor,
    hasMore: nextCursor !== null
  })
})

// GET /products/:id
app.get('/products/:id', async (c) => {
  const prisma = createPrisma(c.env.DATABASE_URL)
  const id = Number(c.req.param('id'))

  const product = await prisma.products.findUnique({ where: { id } })
  if (!product) return c.json({ error: 'Not found' }, 404)

  return c.json(product)
})

// GET /categories
app.get('/categories', async (c) => {
  const prisma = createPrisma(c.env.DATABASE_URL)

  const rows = await prisma.products.findMany({
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' }
  })

  return c.json(rows.map(r => r.category))
})

export default app