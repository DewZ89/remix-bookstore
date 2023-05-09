import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  const email = 'manouman@live.fr'
  const username = 'd&Wz'

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  })

  const hashedPassword = await bcrypt.hash('password', 10)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  await prisma.note.create({
    data: {
      title: 'My first note',
      body: 'Hello, world!',
      userId: user.id,
    },
  })

  await prisma.note.create({
    data: {
      title: 'My second note',
      body: 'Hello, world!',
      userId: user.id,
    },
  })

  const author = {
    name: 'Robert C. Martin',
    bio: `Robert C. Martin is a professional developer since 1970`,
  }

  await prisma.author.deleteMany()
  await prisma.author.create({
    data: {
      ...author,
      creator: { connect: { id: user.id } },
      books: {
        create: [
          {
            isbn: '978-2-3260-0286-9',
            creator: { connect: { id: user.id } },
            summary: 'Pratice clean agile',
            title: 'Clean Agile',
            publishedAt: new Date('2021-07-01'),
          },
          {
            isbn: '978-2-3260-0287-9',
            creator: { connect: { id: user.id } },
            summary: 'Clean Architecture',
            title: 'Become a pro of clean software architecture',
            publishedAt: new Date('2021-05-01'),
          },
        ],
      },
    },
  })

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
