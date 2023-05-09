import { Outlet } from '@remix-run/react'

export default function BooksPage() {
  return (
    <div>
      <p> Books </p>

      <Outlet />
    </div>
  )
}
