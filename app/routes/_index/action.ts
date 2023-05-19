import { parse } from '@conform-to/zod'
import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { verifyLogin } from '~/models/user.server'
import { createUserSession } from '~/session.server'
import { safeRedirect } from '~/utils'

export type ActionData = {
  errors: {
    email: string | null
    password: string | null
  }
}

export const schema = z.object({
  email: z.coerce
    .string()
    .min(1, 'Email is required')
    .email('Email must be valid'),
  password: z.coerce.string().min(1, 'Password is required'),
  redirectTo: z.coerce.string().min(1, 'Redirect URL is required'),
  remember: z.coerce.string().nullable(),
})

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

  invariant(submission.value, 'form cannot be empty')

  const user = await verifyLogin(
    submission.value.email,
    submission.value.password
  )

  if (!user)
    return json(
      {
        ...submission,
        error: { '': 'Invalid email/password' },
      },
      { status: 400 }
    )

  return createUserSession({
    redirectTo,
    remember: submission.value.remember === 'on',
    request,
    userId: user.id,
  })
}
