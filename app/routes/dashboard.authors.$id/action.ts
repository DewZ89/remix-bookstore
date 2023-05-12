import type { ActionFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import type { ZodError } from 'zod'
import { z } from 'zod'
import {
  createAuthor,
  deleteAuthor,
  updateAuthor,
} from '~/models/author.server'
import { getUser } from '~/session.server'

export type ActionData = {
  errors: {
    name?: ZodError | null
    bio?: ZodError | null
  }
}

export const actionFn: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData()
  const name = formData.get('name')
  const bio = formData.get('bio')
  const action = formData.get('_action')

  const id = params.id
  const user = await getUser(request)

  invariant(id, 'Id param is required')
  invariant(typeof action === 'string', 'Action is required')
  invariant(user !== null, 'User is required')
  invariant(typeof name === 'string', 'Name is required')
  invariant(typeof bio === 'string', 'Bio is required')

  const nameValidationResult = z.coerce
    .string()
    .min(6, { message: 'Name must contains at least 6 chars' })
    .safeParse(name)
  const bioValidationResult = z.coerce.string().optional().safeParse(bio)

  const errors: ActionData['errors'] = {
    name: nameValidationResult.success ? null : nameValidationResult.error,
    bio: bioValidationResult.success ? null : bioValidationResult.error,
  }

  if (Object.values(errors).some((value) => value !== null))
    return json<ActionData>({ errors }, { status: 400 })

  if (action === 'new') await createAuthor({ userId: user.id, name, bio })
  if (action === 'update') await updateAuthor(id, { name, bio })
  if (action === 'delete') await deleteAuthor(id)

  return redirect('/dashboard/authors')
}
