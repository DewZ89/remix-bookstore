import type { Prisma } from '@prisma/client'
import { prisma } from '~/db.server'

export type { Book } from '@prisma/client'

export function getBooks() {
  return prisma.book.findMany()
}

export function getBooksWithAuthor() {
  return prisma.book.findMany({ include: { author: true } })
}

export function createBook(
  data: Omit<
    Prisma.BookCreateInput,
    'createdAt' | 'updatedAt' | 'creator' | 'author'
  > & { authorId: string; userId: string }
) {
  return prisma.book.create({ data })
}

export function getBookByIsbn(isbn: string) {
  return prisma.book.findUnique({ where: { isbn } })
}

export function findBooksByIsbn(isbn: string, exclude?: string[]) {
  return prisma.book.findMany({
    where: { isbn: { notIn: exclude, equals: isbn } },
  })
}

export function updateBook(
  isbn: string,
  data: Omit<
    Prisma.BookCreateInput,
    'createdAt' | 'updatedAt' | 'creator' | 'author'
  > & { authorId: string }
) {
  return prisma.book.update({ where: { isbn }, data })
}

export function deleteBook(isbn: string) {
  return prisma.book.delete({ where: { isbn } })
}
