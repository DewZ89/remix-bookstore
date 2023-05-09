import { Book, Prisma } from '@prisma/client'
import { prisma } from '~/db.server'

export type { Book } from '@prisma/client'

export function getBooks() {
  return prisma.book.findMany()
}

export function getBooksWithAuthor() {
  return prisma.book.findMany({ include: { author: true } })
}
