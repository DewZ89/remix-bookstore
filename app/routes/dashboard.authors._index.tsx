import { json } from '@remix-run/node'

import type { LoaderArgs, LoaderFunction } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { getAuthorsWithBookCount } from '~/models/author.server'

import { excerpt } from '~/utils'

type LoaderData = {
  authors: Awaited<ReturnType<typeof getAuthorsWithBookCount>>
}

export const loader: LoaderFunction = async (args: LoaderArgs) => {
  const authors = await getAuthorsWithBookCount()

  return json<LoaderData>({ authors })
}

const cellClassName = 'border border-slate-300 px-4 py-2 truncate'

export default function AuthorListPage() {
  const { authors } = useLoaderData<LoaderData>()
  const fetcher = useFetcher()

  return (
    <div className='flex max-w-full flex-col space-y-4'>
      <div className=' flex items-center justify-between'>
        <h2 className='text-2xl'>Authors List</h2>
        <Link
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700 disabled:bg-blue-200'
          to='new'
        >
          Add Author
        </Link>
      </div>
      <div className='flex w-full'>
        <table className='w-full border-collapse border border-slate-400'>
          <thead className='bg-slate-200'>
            <tr className=''>
              <th className={cellClassName}>Name</th>
              <th className={cellClassName}>Bio</th>
              <th className={cellClassName}>Books</th>
              <th className={cellClassName}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authors.length === 0 ? (
              <tr>
                <td className={cellClassName} colSpan={4}>
                  There is no author to show
                </td>
              </tr>
            ) : (
              <>
                {authors.map((author) => (
                  <tr key={author.id} className='hover:bg-slate-100'>
                    <td className={cellClassName}>{author.name}</td>
                    <td className={cellClassName} title={author.bio}>
                      {excerpt(author.bio)}
                    </td>
                    <td className={cellClassName}>{author._count.books}</td>
                    <td
                      className={`${cellClassName} space-x-2 text-center text-sm`}
                    >
                      <Link
                        prefetch='intent'
                        className='inline-block  font-bold uppercase text-blue-600 hover:underline'
                        to={author.id}
                      >
                        Edit
                      </Link>
                      <fetcher.Form
                        className='inline-block'
                        method='delete'
                        action={`${author.id}/delete`}
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
