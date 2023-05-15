import type { V2_MetaFunction } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import { actionFn } from './action'
import type { ActionData } from './action'
import type { LoaderData } from './loader'
import { loaderFn } from './loader'

export const meta: V2_MetaFunction = ({ data }) => {
  let title = 'Create a new book'

  if (data && data.book) title = `Edit ${data.book.title}`

  return [{ title }]
}

export const action = actionFn
export const loader = loaderFn

const labelCls = 'text-sm font-medium text-gray-700'
const inputCls = 'w-full rounded border border-gray-500 px-2 py-1 text-lg'
const errorMessageCls = 'pt-1 text-sm text-red-700'

export default function BookForm() {
  const { book, authors } = useLoaderData<LoaderData>()
  const { errors } = useActionData<ActionData>() || {}

  const { state, formData } = useNavigation()
  const isLoading = state === 'loading'
  const isSubmitting = state === 'submitting'
  const isTransitioning = isLoading || isSubmitting
  const isCreating = isTransitioning && formData?.get('_action') === 'new'
  const isEditing = isTransitioning && formData?.get('_action') === 'update'
  const isDeleting = isTransitioning && formData?.get('_action') === 'delete'
  const isNewBook = !book

  return (
    <div className='flex flex-col space-y-4'>
      <p className='text-2xl'>
        {book ? `Edit ${book.title}` : 'Create a new book'}
      </p>
      <Form method='POST' className='flex w-1/3 flex-col space-y-4'>
        <div>
          <label htmlFor='isbn' className={labelCls}>
            ISBN
          </label>
          <div>
            <input
              className={`${inputCls} read-only:border-none read-only:outline-none read-only:focus:border-none`}
              type='text'
              name='isbn'
              id='isbn'
              required
              aria-invalid={errors?.isbn ? true : undefined}
              defaultValue={book?.isbn}
              readOnly={!isNewBook}
              aria-describedby='isbn-error'
              autoFocus={true}
            />
            {Boolean(errors?.isbn) && (
              <div role='alert' id='isbn-error' className={errorMessageCls}>
                {errors?.isbn}
              </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor='title' className={labelCls}>
            Title
          </label>
          <div>
            <input
              className={inputCls}
              type='text'
              name='title'
              id='title'
              aria-invalid={errors?.title ? true : undefined}
              defaultValue={book?.title}
              aria-describedby='title-error'
              required
            />
            {Boolean(errors?.title) && (
              <div role='alert' id='title-error' className={errorMessageCls}>
                {errors?.title}
              </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor='authorId' className={labelCls}>
            Author
          </label>
          <select
            className='w-full rounded border border-gray-500 px-2 py-2 text-lg'
            name='authorId'
            id='authorId'
            aria-invalid={errors?.authorId ? true : undefined}
            aria-describedby='author-error'
            defaultValue={book?.authorId}
            required
          >
            {authors.length === 0 ? (
              <option value=''>No author found</option>
            ) : (
              authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))
            )}
          </select>
          {Boolean(errors?.authorId) && (
            <div role='alert' id='author-error' className={errorMessageCls}>
              {errors?.authorId}
            </div>
          )}
        </div>
        <div>
          <label className={labelCls} htmlFor='publishedAt'>
            Published at
          </label>
          <div>
            <input
              required
              className={inputCls}
              type='date'
              name='publishedAt'
              defaultValue={
                book?.publishedAt
                  ? new Date(book?.publishedAt).toISOString().substring(0, 10)
                  : new Date().toISOString().substring(0, 10)
              }
              id='publishedAt'
              aria-invalid={errors?.publishedAt ? true : undefined}
              aria-describedby='published-error'
            />
            {Boolean(errors?.publishedAt) && (
              <div
                role='alert'
                id='published-error'
                className={errorMessageCls}
              >
                {errors?.publishedAt}
              </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor='summary' className={labelCls}>
            Summary
          </label>
          <div>
            <textarea
              name='summary'
              id='summary'
              rows={10}
              className={`${inputCls} resize-none`}
              aria-invalid={errors?.summary ? true : undefined}
              aria-describedby='summary-error'
              defaultValue={book?.summary ? book.summary : undefined}
            ></textarea>
            {Boolean(errors?.summary) && (
              <div role='alert' id='summary-error' className={errorMessageCls}>
                {errors?.summary}
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end space-x-4'>
          <button
            type='submit'
            name='_action'
            value='delete'
            className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400 active:bg-red-700 disabled:bg-red-200'
            disabled={isTransitioning}
            aria-disabled={isTransitioning || undefined}
          >
            {isDeleting ? 'Deleting book' : 'Delete book'}
          </button>
          <button
            type='submit'
            value={isNewBook ? 'new' : 'update'}
            name='_action'
            disabled={isTransitioning}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
          >
            {isNewBook && !isTransitioning && 'Add book'}
            {!isNewBook && !isTransitioning && 'Update book'}
            {isNewBook && isCreating ? 'Adding book' : null}
            {!isNewBook && isEditing ? 'Updating book' : null}
          </button>
        </div>
      </Form>
    </div>
  )
}
