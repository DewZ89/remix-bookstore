import type { ActionFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { ZodError } from 'zod'
import { z } from 'zod'
import { zx } from 'zodix'
import {
  createBook,
  deleteBook,
  getBookByIsbn,
  updateBook,
} from '~/models/book.server'
import { getUser } from '~/session.server'
import { errorAtPath } from '~/utils'

const bookSchema = z.object({
  isbn: z.coerce.string(),
  title: z.coerce.string().min(5, 'Title must contains at least 5 characters'),
  authorId: z.coerce
    .string()
    .cuid('Author is invalid. Please choose one from the list'),
  summary: z.coerce.string().optional(),
  publishedAt: z.coerce
    .date()
    .max(new Date(), 'Publication date can not be in the future'),
})

type BookSchema = z.infer<typeof bookSchema>

export type ActionData = {
  errors: {
    isbn?: string
    title?: string
    publishedAt?: string
    summary?: string
    authorId?: string
  }
}

function buildErrors(error: ZodError) {
  return {
    authorId: errorAtPath<BookSchema>(error, 'authorId'),
    isbn: errorAtPath<BookSchema>(error, 'isbn'),
    publishedAt: errorAtPath<BookSchema>(error, 'publishedAt'),
    summary: errorAtPath<BookSchema>(error, 'summary'),
    title: errorAtPath<BookSchema>(error, 'title'),
  }
}

export const actionFn: ActionFunction = async ({ request, params }) => {
  const parseResults = await zx.parseFormSafe(request, bookSchema)

  const formData = await request.formData()
  const action = formData.get('_action')
  invariant(params.id, 'Id is required')

  if (!parseResults.success)
    return json<ActionData>(
      {
        errors: buildErrors(parseResults.error),
      },
      { status: 400 }
    )

  const data = parseResults.success ? parseResults.data : null
  invariant(data !== null, 'Data is required')

  const existingBook = await getBookByIsbn(data?.isbn)
  if (action === 'new' && existingBook)
    return json<ActionData>({
      errors: { isbn: 'A book with this isbn code already exists' },
    })

  const user = await getUser(request)
  invariant(user, 'User is required')

  if (action === 'new') await createBook({ ...data, userId: user?.id })
  if (action === 'update') await updateBook(params.id, { ...data })
  if (action === 'delete') await deleteBook(params.id)

  return redirect('/dashboard/books')
}
