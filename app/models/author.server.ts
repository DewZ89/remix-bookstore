import { prisma } from '~/db.server'
import { Prisma } from '@prisma/client'

export type { Author } from '@prisma/client'

export function getAuthorsWithBookCount() {
  return prisma.author.findMany({
    include: { _count: { select: { books: true } } },
  })
}

export function createAuthor(
  data: Pick<Prisma.AuthorCreateInput, 'name' | 'bio'> & { userId: string }
) {
  return prisma.author.create({
    data: {
      name: data.name,
      bio: data.bio,
      creator: { connect: { id: data.userId } },
    },
  })
}

export function getAuthorById(id: string) {
  return prisma.author.findUniqueOrThrow({ where: { id } })
}

export function updateAuthor(
  id: string,
  data: Pick<Prisma.AuthorUpdateInput, 'name' | 'bio'>
) {
  return prisma.author.update({ data, where: { id } })
}

export function deleteAuthor(id: string) {
  return prisma.author.delete({ where: { id } })
}
