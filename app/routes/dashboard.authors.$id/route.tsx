import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import type { V2_MetaFunction } from '@remix-run/node'

import { loaderFn } from './loader'
import type { LoaderData } from './loader'
import type { ActionData } from './action'
import { actionFn } from './action'

export const meta: V2_MetaFunction = ({ data: { author } }) => {
  let title = 'Create author'
  if (author) {
    title = `Edit ${author.name}`
  }

  return [{ title }]
}

export const loader = loaderFn

export const action = actionFn

export default function AuthorForm() {
  const { state, formData } = useNavigation()
  const isLoading = state === 'loading'
  const isSubmitting = state === 'submitting'

  const isTransitioning = isSubmitting || isLoading

  const { author } = useLoaderData<LoaderData>()
  const { errors } = useActionData<ActionData>() || {}

  const isEditing = isTransitioning && formData?.get('_action') === 'update'
  const isCreating = isTransitioning && formData?.get('_action') === 'new'
  const isDeleting = isTransitioning && formData?.get('_action') === 'delete'
  const isNewAuthor = !author

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
              disabled={isTransitioning}
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
            disabled={isTransitioning}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
          >
            {isEditing ? 'Updating author' : null}
            {isCreating ? 'Adding author' : null}
            {isNewAuthor && !isCreating && !isEditing ? 'Add author' : null}
            {!isNewAuthor && !isCreating && !isEditing ? 'Update author' : null}
          </button>
        </div>
      </Form>
    </div>
  )
}
