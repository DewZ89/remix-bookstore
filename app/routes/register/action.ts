import { parse } from '@conform-to/zod'
import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { z } from 'zod'
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
} from '~/models/user.server'
import { createUserSession } from '~/session.server'
import { safeRedirect } from '~/utils'

type FormError = {
  username?: string | null
  email?: string | null
  password?: string | null
}

export type ActionData = {
  errors: FormError
}

export const schema = z.object({
  username: z.coerce.string().min(3, 'Username must contains 3 chars or more'),
  email: z.coerce
    .string()
    .min(1, 'Email is required')
    .email('Email must be valid'),
  password: z.coerce.string().min(8, 'Password must contains 8 or more chars'),
  redirectTo: z.coerce.string().optional(),
})

async function validateUniqueConstraint(formValue: z.infer<typeof schema>) {
  const error: Record<string, string | undefined> = {}

  if (await getUserByEmail(formValue.email))
    error.email = 'A user already exists with this email'
  if (await getUserByUsername(formValue.username))
    error.username = 'A user already exists with this username'

  return error
}

export const actionFn: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const submission = parse(formData, { schema })

  const redirectTo = safeRedirect(submission.value?.redirectTo, '/dashboard')

  if (!submission.value || submission.intent !== 'submit')
    return json(
      {
        submission: {
          ...submission,
          payload: { ...submission.payload, redirectTo },
        },
      },
      { status: 400 }
    )

  const error = await validateUniqueConstraint(submission.value)

  if (Object.values(error).some((value) => value !== undefined))
    return json({ ...submission, error }, { status: 400 })

  const user = await createUser({
    email: submission.value.email,
    password: submission.value.password,
    username: submission.value.username,
  })

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  })
}
