import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { verifyLogin } from '~/models/user.server'
import { createUserSession } from '~/session.server'
import { safeRedirect, validateEmail } from '~/utils'

export type ActionData = {
  errors: {
    email: string | null
    password: string | null
  }
}

export const actionFn: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/dashboard')
  const remember = formData.get('remember')

  invariant(typeof email === 'string', 'Email is required')
  invariant(typeof password === 'string', 'Password is required')

  const errors: ActionData['errors'] = {
    email: !validateEmail(email) ? 'Email is invalid' : null,
    password: !password ? 'Password is required' : null,
  }

  const user = await verifyLogin(email, password)

  errors.email = !user ? 'Invalid email or password' : null

  if (Object.values(errors).some((value) => value !== null))
    return json<ActionData>({ errors })

  invariant(user !== null, 'User must be defined')

  return createUserSession({
    redirectTo,
    remember: remember === 'on',
    request,
    userId: user.id,
  })
}
