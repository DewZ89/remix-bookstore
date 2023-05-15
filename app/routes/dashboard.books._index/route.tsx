import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { excerpt } from '~/utils'
import { loaderFn } from './loader'
import type { LoaderData } from './loader'

export const loader = loaderFn

const cellClassName = 'border border-slate-300 px-4 py-2 truncate'

export default function BookListPage() {
  const { books } = useLoaderData<LoaderData>()
  const fetcher = useFetcher()

  return (
    <div className='flex max-w-full flex-col space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl'>Books list</h2>
        <Link
          to='new'
          className='inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
        >
          Add Book
        </Link>
      </div>

      <div className='flex w-full'>
        <table className='w-full border-collapse border border-slate-400'>
          <thead className='bg-slate-200'>
            <tr className=''>
              <th className={cellClassName}>ISBN</th>
              <th className={cellClassName}>Title</th>
              <th className={cellClassName}>Author</th>
              <th className={cellClassName}>Summary</th>
              <th className={cellClassName}>Published at</th>
              <th className={cellClassName}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr className='grid grid-cols-6'>
                <td className={cellClassName} colSpan={4}>
                  There is no book to show
                </td>
              </tr>
            ) : (
              <>
                {books.map((book) => (
                  <tr key={book.isbn} className='hover:bg-slate-100'>
                    <td className={cellClassName}>{book.isbn}</td>
                    <td className={cellClassName} title={book.title}>
                      {book.title}
                    </td>
                    <td className={cellClassName}>{book.author.name}</td>
                    <td
                      className={cellClassName}
                      title={book.summary ? book.summary : undefined}
                    >
                      {!!book.summary && excerpt(book.summary)}
                    </td>
                    <td className={cellClassName}>
                      {new Date(book.publishedAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`${cellClassName} flex items-center justify-evenly space-x-2 text-sm`}
                    >
                      <Link
                        prefetch='intent'
                        className='inline-block font-bold uppercase text-blue-600 hover:underline'
                        to={book.isbn}
                      >
                        Edit
                      </Link>
                      <fetcher.Form
                        method='PUT'
                        className='inline-block'
                        action={`${book.isbn}/delete`}
                      >
                        <button
                          type='submit'
                          className='font-bold uppercase text-red-600 hover:underline'
                        >
                          Delete
                        </button>
                      </fetcher.Form>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
