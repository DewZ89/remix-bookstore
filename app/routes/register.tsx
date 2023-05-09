import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'

import {
  createUser,
  getUserByEmail,
  getUserByUsername,
} from '~/models/user.server'
import { createUserSession, getUserId } from '~/session.server'
import { safeRedirect, validateEmail } from '~/utils'
import invariant from 'tiny-invariant'

type FormError = {
  username?: string | null
  email?: string | null
  password?: string | null
}

type ActionData = {
  errors: FormError
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

export const action = async ({ request }: ActionArgs) => {
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

export const meta: V2_MetaFunction = () => [{ title: 'Sign Up' }]

export default function Join() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? undefined
  const { errors } = useActionData<ActionData>() || {}

  const [username, setUsername] = useState('')

  const { state } = useNavigation()
  const submitting = state === 'submitting' || state === 'loading'

  function onEmailChange(e: ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value.split('@')[0])
  }

  function onChangeUsername(e: ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value)
  }

  return (
    <div className='flex min-h-full flex-col justify-center bg-gray-50'>
      <div className='transition-tranform mx-auto my-4 w-full max-w-md origin-bottom-left text-center text-2xl tracking-wide duration-75 hover:-rotate-2'>
        Join Bookstore Universe!
      </div>
      <div className='border-1 mx-auto w-full max-w-md rounded-md border-gray-500 bg-slate-100 px-10 py-8 opacity-90 shadow'>
        <Form method='post' className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'
            >
              Email address
            </label>
            <div className='mt-1'>
              <input
                id='email'
                required
                autoFocus={true}
                name='email'
                type='email'
                autoComplete='email'
                aria-invalid={errors?.email ? true : undefined}
                aria-describedby='email-error'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
                onChange={onEmailChange}
              />
              {Boolean(errors?.email) && (
                <div
                  className='pt-1 text-red-700'
                  id='email-error'
                  role='alert'
                >
                  {errors?.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium text-gray-700'
            >
              Username
            </label>
            <div className='mt-1'>
              <input
                id='username'
                required
                name='username'
                value={username}
                onChange={onChangeUsername}
                type='text'
                aria-invalid={errors?.username ? true : undefined}
                aria-describedby='username-error'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {Boolean(errors?.username) && (
                <div
                  className='pt-1 text-red-700'
                  id='username-error'
                  role='alert'
                >
                  {errors?.username}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <div className='mt-1'>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='new-password'
                aria-invalid={errors?.password ? true : undefined}
                aria-describedby='password-error'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {Boolean(errors?.password) && (
                <div
                  className='pt-1 text-red-700'
                  id='password-error'
                  role='alert'
                >
                  {errors?.password}
                </div>
              )}
            </div>
          </div>

          <input type='hidden' name='redirectTo' value={redirectTo} />
          <button
            type='submit'
            disabled={submitting}
            className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
          <div className='flex items-center justify-center'>
            <div className='text-center text-sm text-gray-500'>
              Already have an account?{' '}
              <Link
                className='text-blue-500 underline'
                to={{
                  pathname: '/',
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
