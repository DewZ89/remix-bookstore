import type { V2_MetaFunction } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'

import { loaderFn } from './loader'
import { actionFn } from './action'
import type { ActionData } from './action'

export const meta: V2_MetaFunction = () => [{ title: 'Login' }]

export const loader = loaderFn

export const action = actionFn

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const { errors } = useActionData<ActionData>() || {}

  const { state } = useNavigation()
  const submitting = ['loading', 'submitting'].includes(state)

  return (
    <div className='flex min-h-full flex-col justify-center bg-gray-50'>
      <div className='transition-tranform mx-auto my-4 w-full max-w-md origin-bottom-left text-center text-2xl tracking-wide duration-75 hover:-rotate-2'>
        Login to enjoy Bookstore!
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
                defaultValue='admin@remix.run'
                aria-invalid={errors?.email ? true : undefined}
                aria-describedby='email-error'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {!!errors?.email && (
                <div className='pt-1 text-red-700' id='email-error'>
                  {errors.email}
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
                defaultValue='password'
                autoComplete='current-password'
                aria-invalid={errors?.password ? true : undefined}
                aria-describedby='password-error'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {!!errors?.password && (
                <div className='pt-1 text-red-700' id='password-error'>
                  {errors.password}
                </div>
              )}
            </div>
          </div>

          <input type='hidden' name='redirectTo' value={redirectTo} />
          <button
            type='submit'
            className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
          >
            {submitting ? 'Login...' : 'Log In'}
          </button>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember'
                name='remember'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor='remember'
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