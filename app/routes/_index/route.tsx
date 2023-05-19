import type { V2_MetaFunction } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { parse } from '@conform-to/zod'

import { loaderFn } from './loader'
import { actionFn, schema } from './action'
import { useForm, conform } from '@conform-to/react'

export const meta: V2_MetaFunction = () => [{ title: 'Login' }]

export const loader = loaderFn

export const action = actionFn

export default function LoginPage() {
  const lastSubmission = useActionData<typeof action>()

  const [searchParams] = useSearchParams()
  const redirectToFromUrl = searchParams.get('redirectTo') || '/dashboard'

  const [form, { email, password, remember, redirectTo }] = useForm({
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
    shouldValidate: 'onBlur',
    id: 'login-form',
  })

  const { state } = useNavigation()
  const submitting = ['loading', 'submitting'].includes(state)

  return (
    <div className='flex min-h-full flex-col justify-center bg-gray-50'>
      <div className='mx-auto my-4 w-full max-w-md origin-bottom-left text-center text-2xl tracking-wide transition-transform duration-75 hover:-rotate-2'>
        Login to enjoy Bookstore!
      </div>
      <div className='border-1 mx-auto w-full max-w-md rounded-md border-gray-500 bg-slate-100 px-10 py-8 opacity-90 shadow'>
        <Form method='post' className='space-y-6' {...form.props}>
          {!!form.error && <p className='my-1 text-red-700'>{form.error}</p>}
          <div>
            <label
              htmlFor={email.id}
              className='block text-sm font-medium text-gray-700'
            >
              Email address
            </label>
            <div className='mt-1'>
              <input
                {...conform.input(email, { type: 'email' })}
                id={email.id}
                required
                defaultValue='admin@remix.run'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {email.error && (
                <div className='pt-1 text-red-700' id='email-error'>
                  {email.error}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor={password.id}
              className='block text-sm font-medium text-gray-700'
            >
              Password
            </label>
            <div className='mt-1'>
              <input
                {...conform.input(password, { type: 'password' })}
                defaultValue='password'
                autoComplete='current-password'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {password.error && (
                <div className='pt-1 text-red-700' id='password-error'>
                  {password.error}
                </div>
              )}
            </div>
          </div>

          <input
            {...conform.input(redirectTo, { hidden: true })}
            defaultValue={redirectToFromUrl}
          />
          <button
            type='submit'
            name={conform.INTENT}
            value='submit'
            className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
          >
            {submitting ? 'Login...' : 'Log In'}
          </button>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                {...conform.input(remember, { type: 'checkbox' })}
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor={remember.id}
                className='ml-2 block text-sm text-gray-900'
              >
                Remember me
              </label>
            </div>
            <div className='text-center text-sm text-gray-500'>
              Don't have an account?{' '}
              <Link
                className='text-blue-500 underline'
                to={{
                  pathname: '/register',
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
