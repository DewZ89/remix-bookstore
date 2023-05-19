import type { V2_MetaFunction } from '@remix-run/node'
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'
import { useForm, conform } from '@conform-to/react'
import { parse } from '@conform-to/zod'
import { actionFn, schema } from './action'
import { loaderFn } from './loader'

export const loader = loaderFn
export const action = actionFn

export const meta: V2_MetaFunction = () => [{ title: 'Sign Up' }]

export default function Join() {
  const lastSubmission = useActionData<typeof action>()

  const [form, { email, username, password, redirectTo }] = useForm({
    lastSubmission,
    shouldValidate: 'onBlur',
    onValidate({ formData }) {
      return parse(formData, { schema })
    },
  })

  const [searchParams] = useSearchParams()
  const redirectToFromUrl = searchParams.get('redirectTo') ?? undefined

  const { state } = useNavigation()
  const submitting = state === 'submitting' || state === 'loading'

  return (
    <div className='flex min-h-full flex-col justify-center bg-gray-50'>
      <div className='transition-tranform mx-auto my-4 w-full max-w-md origin-bottom-left text-center text-2xl tracking-wide duration-75 hover:-rotate-2'>
        Join Bookstore Universe!
      </div>
      <div className='border-1 mx-auto w-full max-w-md rounded-md border-gray-500 bg-slate-100 px-10 py-8 opacity-90 shadow'>
        <Form method='post' className='space-y-6' {...form.props}>
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
                required
                autoFocus={true}
                autoComplete='email'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {email.error && (
                <div
                  className='pt-1 text-red-700'
                  id={email.errorId}
                  role='alert'
                >
                  {email.error}
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
                {...conform.input(username)}
                required
                type='text'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {username.error && (
                <div
                  className='pt-1 text-red-700'
                  id={username.errorId}
                  role='alert'
                >
                  {username.error}
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
                {...conform.input(password, { type: 'password' })}
                required
                autoComplete='new-password'
                className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              />
              {password.error && (
                <div
                  className='pt-1 text-red-700'
                  id={password.errorId}
                  role='alert'
                >
                  {password.error}
                </div>
              )}
            </div>
          </div>

          <input
            {...conform.input(redirectTo, { type: 'hidden' })}
            type='hidden'
            defaultValue={redirectToFromUrl}
          />
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
