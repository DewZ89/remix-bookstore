import type { ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { deleteAuthor } from '~/models/author.server'

export const actionFn: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'DELETE') return redirect('/dashboard/authors')

  const id = params.id
  invariant(typeof id === 'string', 'Id is required')

  await deleteAuthor(id)

  return redirect('/dashboard/authors')
}
