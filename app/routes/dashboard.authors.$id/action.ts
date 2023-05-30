import { parse } from '@conform-to/zod'
import type { ActionFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import {
  createAuthor,
  deleteAuthor,
  updateAuthor,
} from '~/models/author.server'
import { getUser } from '~/session.server'

export const schema = z.object({
  name: z.coerce.string().min(6, 'Name must contains at least 6 chars'),
  bio: z.coerce.string().optional(),
  _action: z.coerce.string(),
})

export const actionFn: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData()
  const submission = parse(formData, { schema })

  const id = params.id
  const user = await getUser(request)

  invariant(id, 'Id param is required')
  invariant(user !== null, 'User is required')

  if (
    !submission.value ||
    !['new', 'update', 'delete'].includes(submission.intent)
  ) {
    return json({ submission }, { status: 400 })
  }

  if (submission.intent === 'new')
    await createAuthor({
      userId: user.id,
      name: submission.value.name,
      bio: String(submission.value.bio),
    })
  if (submission.intent === 'update')
    await updateAuthor(id, {
      name: submission.value.name,
      bio: submission.value.bio,
    })
  if (submission.intent === 'delete') await deleteAuthor(id)

  return redirect('/dashboard/authors')
}
