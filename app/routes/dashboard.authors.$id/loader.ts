import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { getAuthorById } from '~/models/author.server'
import { requireUser } from '~/session.server'

export type LoaderData = {
  author?: Awaited<ReturnType<typeof getAuthorById>>
}

export const loaderFn: LoaderFunction = async ({ request, params }) => {
  await requireUser(request)
  const id = params.id

  if (id && id !== 'new') {
    const author = await getAuthorById(id)
    return json<LoaderData>({ author })
  }

  return json<LoaderData>({})
}
