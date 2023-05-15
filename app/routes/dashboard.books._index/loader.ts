import type { LoaderArgs, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { getBooksWithAuthor } from '~/models/book.server'

export type LoaderData = {
  books: Awaited<ReturnType<typeof getBooksWithAuthor>>
}

export const loaderFn: LoaderFunction = async (args: LoaderArgs) => {
  const books = await getBooksWithAuthor()

  return json<LoaderData>({ books })
}
