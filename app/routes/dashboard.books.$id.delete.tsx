import type { ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { deleteBook } from '~/models/book.server'

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'DELETE') return redirect('/dashboard/authors')

  invariant(params.id, 'Id is required')

  await deleteBook(params.id)

  return redirect('/dashboard/books')
}
