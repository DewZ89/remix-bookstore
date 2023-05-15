import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { getAuthorsList } from '~/models/author.server'
import { getBookByIsbn } from '~/models/book.server'
import { getUser } from '~/session.server'

export type LoaderData = {
  authors: Awaited<ReturnType<typeof getAuthorsList>>
  book?: Awaited<ReturnType<typeof getBookByIsbn>>
}

export const loaderFn: LoaderFunction = async ({ request, params }) => {
  await getUser(request)

  const authors = await getAuthorsList()
  let book

  if (params && params.id !== 'new') {
    invariant(params.id, 'Id parameter is required')
    book = await getBookByIsbn(params.id)
  }

  return json<LoaderData>({ authors, book })
}
