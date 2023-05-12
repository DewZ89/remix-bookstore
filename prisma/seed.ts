import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  const email = 'admin@remix.run'
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
            summary: 'Practice clean agile',
            title: 'Clean Agile',
            publishedAt: new Date('2021-07-01'),
          },
          {
            isbn: '978-2-3260-0287-9',
            creator: { connect: { id: user.id } },
            summary: 'Become a pro of clean software architecture',
            title: 'Clean Architecture',
            publishedAt: new Date('2021-05-01'),
          },
          {
            isbn: '978-2-3260-0287-10',
            creator: { connect: { id: user.id } },
            summary: 'Become a pro of clean coding',
            title: 'The Clean Coder',
            publishedAt: new Date('2021-05-01'),
          },
          {
            isbn: '978-2-3260-0287-11',
            creator: { connect: { id: user.id } },
            title: 'Clean Code',
            publishedAt: new Date('2021-05-01'),
          },
          {
            isbn: '978-2-3260-0287-12',
            creator: { connect: { id: user.id } },
            summary: `In Clean Craftsmanship, the legendary Robert C. Martin ("Uncle Bob") 
            has written the principles that define the profession--and the craft--of software 
            development. Uncle Bob brings together the disciplines, standards, and ethics 
            you need to deliver robust, effective code and to be proud of all the software you write.`,
            title: 'Clean Craftsmanship',
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
