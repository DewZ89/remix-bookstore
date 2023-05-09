import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'

import { getNoteListItems } from '~/models/note.server'
import { requireUserId } from '~/session.server'
import { useUser } from '~/utils'

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request)
  const noteListItems = await getNoteListItems({ userId })
  return json({ noteListItems })
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>()
  const user = useUser()

  return (
    <div className='flex h-full min-h-screen flex-col'>
      <header className='flex items-center space-x-4 bg-slate-800 px-4 py-2 text-white'>
        <h1 className='flex-1 text-2xl font-bold'>
          <Link to='.'>Bookstore</Link>
        </h1>

        <p>Welcome, {user.username}</p>
        <Form action='/logout' method='post'>
          <button
            type='submit'
            className='rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600'
          >
            Logout
          </button>
        </Form>
      </header>

      <main className='flex h-full bg-white'>
        <div className='h-full w-64 border-r bg-gray-50'>
          <ul>
            <li>
              <NavLink
                to='books'
                className={({ isActive }) =>
                  `block border-b px-4 py-2 text-lg active:bg-blue-100 ${
                    isActive ? 'bg-blue-200' : 'hover:bg-blue-50'
                  }`
                }
              >
                Books
              </NavLink>
              <NavLink
                to='authors'
                className={({ isActive }) =>
                  `block border-b px-4 py-2 text-lg active:bg-blue-100 ${
                    isActive ? 'bg-blue-200' : 'hover:bg-blue-50'
                  }`
                }
              >
                Authors
              </NavLink>
            </li>
          </ul>

          <hr />
        </div>

        <div className='flex-1 p-6'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
