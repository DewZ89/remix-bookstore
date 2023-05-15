import type { ActionFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { ZodError } from 'zod'
import { z } from 'zod'
import { zx } from 'zodix'
import {
  createAuthor,
  deleteAuthor,
  updateAuthor,
} from '~/models/author.server'
import { getUser } from '~/session.server'
import { errorAtPath } from '~/utils'

export type ActionData = {
  errors: {
    name?: string
    bio?: string
  }
}

const authorSchema = z.object({
  name: z.coerce.string().min(6, 'Name must contains at least 6 chars'),
  bio: z.coerce.string().optional(),
  _action: z.coerce.string(),
})

type AuthorSchema = z.infer<typeof authorSchema>

function buildErrors(errors: ZodError): ActionData['errors'] {
  return {
    name: errorAtPath<AuthorSchema>(errors, 'name'),
    bio: errorAtPath<AuthorSchema>(errors, 'bio'),
  }
}

export const actionFn: ActionFunction = async ({ params, request }) => {
  const parseResults = await zx.parseFormSafe(request, authorSchema)

  const id = params.id
  const user = await getUser(request)

  invariant(id, 'Id param is required')
  invariant(user !== null, 'User is required')

  if (!parseResults.success) {
    return json<ActionData>(
      { errors: buildErrors(parseResults.error) },
      { status: 400 }
    )
  }

  const data = parseResults.success ? parseResults.data : null
  invariant(data !== null, 'Data cannot be null')

  if (data._action === 'new')
    await createAuthor({
      userId: user.id,
      name: data.name,
      bio: String(data.bio),
    })
  if (data._action === 'update')
    await updateAuthor(id, { name: data.name, bio: data.bio })
  if (data._action === 'delete') await deleteAuthor(id)

  return redirect('/dashboard/authors')
}
