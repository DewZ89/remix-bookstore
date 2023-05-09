import { json } from '@remix-run/node'
import { getBooksWithAuthor } from '~/models/book.server'

import { LoaderArgs, LoaderFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

type LoaderData = {
  books: Awaited<ReturnType<typeof getBooksWithAuthor>>
}

export const loader: LoaderFunction = async (args: LoaderArgs) => {
  const books = await getBooksWithAuthor()

  return json<LoaderData>({ books })
}

const cellClassName = 'border border-slate-300 px-4 py-2 truncate'

export default function BookListPage() {
  const { books } = useLoaderData<LoaderData>()

  return (
    <div>
      <p>Book List</p>

      <div className='flex w-full'>
        <table className='w-full border-collapse border border-slate-400'>
          <thead className='bg-slate-200'>
            <tr className='grid grid-cols-6'>
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
                  <tr
                    key={book.isbn}
                    className='grid grid-cols-6 hover:bg-slate-100'
                  >
                    <td className={cellClassName}>{book.isbn}</td>
                    <td className={cellClassName} title={book.title}>
                      {book.title}
                    </td>
                    <td className={cellClassName}>{book.author.name}</td>
                    <td className={cellClassName} title={book.summary}>
                      {book.summary}
                    </td>
                    <td className={cellClassName}>
                      {new Date(book.publishedAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`${cellClassName} flex items-center justify-evenly space-x-2 text-sm uppercase`}
                    >
                      <Link
                        className='inline-block font-bold text-blue-600 hover:underline'
                        to=''
                      >
                        Edit
                      </Link>
                      <Link
                        to=''
                        className='inline-block font-bold text-red-600 hover:underline'
                      >
                        Delete
                      </Link>
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
