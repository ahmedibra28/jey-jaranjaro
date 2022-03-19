import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  FaUserCircle,
  FaPowerOff,
  FaHome,
  FaDollarSign,
  FaChartPie,
  FaHandHoldingUsd,
} from 'react-icons/fa'
import { logout } from '../api/users'
import { useMutation } from 'react-query'
import { useRouter } from 'next/router'

const Navigation = () => {
  const router = useRouter()
  const { mutateAsync } = useMutation(logout, {
    onSuccess: () => router.push('/login'),
  })

  const logoutHandler = () => {
    mutateAsync({})
  }

  const userInfo =
    typeof window !== 'undefined' && localStorage.getItem('userInfo')
      ? JSON.parse(
          typeof window !== 'undefined' && localStorage.getItem('userInfo')
        )
      : null

  return (
    <div className='div position-relative'>
      <ul
        className='nav nav-pills nav-fill shadow-sm p-1 position-fixed bottom-0 w-100 bg-outline-light'
        style={{ zIndex: 1 }}
      >
        {userInfo ? (
          <>
            <li className='nav-item'>
              <Link href='/'>
                <a className='btn p-3' aria-current='page'>
                  <FaHome className='text-primary fs-4' />
                </a>
              </Link>
            </li>
            <li className='nav-item'>
              <Link href='/orders/receipt'>
                <a className='btn p-3' aria-current='page'>
                  <FaDollarSign className='text-primary fs-4' />
                </a>
              </Link>
            </li>
            <li className='nav-item'>
              <Link href='/transactions'>
                <a className='btn p-3' aria-current='page'>
                  <FaChartPie className='text-primary fs-4' />
                </a>
              </Link>
            </li>
            <li className='nav-item'>
              <Link href='/expenses'>
                <a className='btn p-3' aria-current='page'>
                  <FaHandHoldingUsd className='text-primary fs-4' />
                </a>
              </Link>
            </li>
            {/* <li className='nav-item'>
          <Link href='/admin/users'>
            <a className='btn p-3' aria-current='page'>
              <FaUserCog className='text-primary fs-4' />
            </a>
          </Link>
        </li> */}
            <li className='nav-item'>
              <Link href='/profile'>
                <a className='btn p-3' aria-current='page'>
                  <FaUserCircle className='text-primary fs-4' />
                </a>
              </Link>
            </li>
            <li className='nav-item'>
              <Link href='/'>
                <a
                  className='btn p-3'
                  aria-current='page'
                  onClick={logoutHandler}
                >
                  <FaPowerOff className='text-primary fs-4' />
                </a>
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className='nav-item'>
              <Link href='/'>
                <a className='btn p-3' aria-current='page'>
                  <FaHome className='text-primary fs-4' />
                </a>
              </Link>
            </li>
            <li className='nav-item'>
              <Link href='/login'>
                <a className='btn p-3' aria-current='page'>
                  <FaPowerOff className='text-primary fs-4' />
                </a>
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  )

  // return (
  //   <nav className='navbar navbar-expand-sm navbar-light shadow-lg'>
  //     <div className='container'>
  //       <Link href='/'>
  //         <a className='navbar-brand'>BABA JEY</a>
  //       </Link>

  //       <button
  //         className='navbar-toggler'
  //         type='button'
  //         data-bs-toggle='collapse'
  //         data-bs-target='#navbarNav'
  //         aria-controls='navbarNav'
  //         aria-expanded='false'
  //         aria-label='Toggle navigation'
  //       >
  //         <span className='navbar-toggler-icon'></span>
  //       </button>
  //       <div className='collapse navbar-collapse' id='navbarNav'>
  //         {userInfo ? authItems() : guestItems()}
  //       </div>
  //     </div>
  //   </nav>
  // )
}

export default dynamic(() => Promise.resolve(Navigation), { ssr: false })
