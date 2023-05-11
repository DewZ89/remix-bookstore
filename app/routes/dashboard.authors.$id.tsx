import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import type {
  ActionFunction,
  V2_MetaFunction,
  LoaderFunction,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import type { ZodError } from 'zod'

import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  updateAuthor,
} from '~/models/author.server'
import { getUser, requireUser } from '~/session.server'

type ActionData = {
  errors: {
    name?: ZodError | null
    bio?: ZodError | null
  }
}

type LoaderData = {
  author?: Awaited<ReturnType<typeof getAuthorById>>
}

export const meta: V2_MetaFunction = ({ data: { author } }) => {
  let title = 'Create author'
  if (author) {
    title = `Edit ${author.name}`
  }

  return [{ title }]
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUser(request)
  const id = params.id

  if (id && id !== 'new') {
    const author = await getAuthorById(id)
    return json<LoaderData>({ author })
  }

  return json<LoaderData>({})
}

export const action: ActionFunction = async ({ params, request }) => {
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

export default function AuthorForm() {
  const { state, formData } = useNavigation()
  const isLoading = state === 'loading'
  const isSubmitting = state === 'submitting'

  console.log({ formData: formData?.get('_action') })

  const isTransitionning = isSubmitting || isLoading

  const { author } = useLoaderData<LoaderData>()
  const { errors } = useActionData<ActionData>() || {}

  const isEditing = isTransitionning && formData?.get('_action') === 'update'
  const isCreating = isTransitionning && formData?.get('_action') === 'new'
  const isDeleting = isTransitionning && formData?.get('_action') === 'delete'
  const isNewAuthor = !Boolean(author)

  return (
    <div className='flex flex-col space-y-4'>
      <p className='text-2xl'>
        {author ? `Edit ${author.name}` : 'Create a new author'}
      </p>
      <Form method='post' className='flex w-1/3 flex-col space-y-4'>
        <div>
          <label htmlFor='name' className='text-sm font-medium text-gray-700'>
            Name
          </label>
          <div className='mt-1'>
            <input
              className='w-full rounded border border-gray-500 px-2 py-1 text-lg'
              type='text'
              name='name'
              id='name'
              required
              defaultValue={author?.name}
              aria-invalid={errors?.name ? true : undefined}
              aria-describedby='name-error'
              autoFocus={true}
            />
            {!!errors?.name && (
              <div
                role='alert'
                id='name-error'
                className='pt-1 text-sm text-red-700'
              >
                {errors.name.issues.map((error) => (
                  <p key={error.code}>{error.message}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor='bio' className='text-sm font-medium text-gray-700'>
            Bio
          </label>
          <div className='mt-1'>
            <textarea
              name='bio'
              id='bio'
              rows={5}
              aria-invalid={errors?.bio ? true : undefined}
              defaultValue={author?.bio}
              aria-describedby='bio-error'
              className='w-full resize-none rounded border border-gray-500 px-2 py-1 text-lg'
            ></textarea>
            {!!errors?.bio && (
              <div
                role='alert'
                id='name-error'
                className='pt-1 text-sm text-red-700'
              >
                {errors.bio.issues.map((error) => (
                  <p key={error.code}>{error.message}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end space-x-4'>
          {!isNewAuthor && (
            <button
              disabled={isTransitionning}
              type='submit'
              value='delete'
              name='_action'
              className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400 active:bg-red-700 disabled:bg-red-200'
            >
              {isDeleting ? 'Deleting author' : 'Delete author'}
            </button>
          )}

          <button
            name='_action'
            value={author ? 'update' : 'new'}
            type='submit'
            disabled={isTransitionning}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
          >
            {isEditing ? 'Updating author' : null}
            {isCreating ? 'Creating author' : null}
            {isNewAuthor && !isCreating && !isEditing ? 'Create author' : null}
            {!isNewAuthor && !isCreating && !isEditing ? 'Update author' : null}
          </button>
        </div>
      </Form>
    </div>
  )
}
