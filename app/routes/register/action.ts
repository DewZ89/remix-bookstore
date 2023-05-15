import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
} from '~/models/user.server'
import { createUserSession } from '~/session.server'
import { safeRedirect, validateEmail } from '~/utils'

type FormError = {
  username?: string | null
  email?: string | null
  password?: string | null
}

export type ActionData = {
  errors: FormError
}

export const actionFn: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const username = formData.get('username')
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/dashboard')

  invariant(typeof email === 'string', 'Email is required')
  invariant(typeof username === 'string', 'Username is required')
  invariant(typeof password === 'string', 'Password is required')

  const errors: FormError = {}

  errors.email = !validateEmail(email) ? 'Email is invalid' : null

  errors.password = !password ? 'Password is required' : null
  errors.password =
    password.length < 8 ? 'Password must contains at least 8 characters' : null

  errors.username = !username ? 'Username is required' : null
  errors.username =
    username.length < 3 ? 'Username must contains at least 3 characters' : null

  if (await getUserByEmail(email))
    errors.email = 'A user already exists with this email'
  if (await getUserByUsername(username))
    errors.username = 'A user already exists with this username'

  if (Object.values(errors).some((value) => value !== null))
    return json<ActionData>(
      {
        errors,
      },
      { status: 400 }
    )

  const user = await createUser({ email, password, username })

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  })
}
