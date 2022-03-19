import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Message from '../components/Message'
import { useForm } from 'react-hook-form'
import { login as loginFun } from '../api/users'
import { useMutation, useQueryClient } from 'react-query'
import { customLocalStorage } from '../utils/customLocalStorage'
import Head from 'next/head'
import { inputEmail, inputPassword } from '../utils/dynamicForm'
import { FaWhatsapp } from 'react-icons/fa'

const Login = () => {
  const router = useRouter()
  const pathName = router.query.next || '/'
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const queryClient = useQueryClient()

  const { isLoading, isError, error, mutateAsync } = useMutation(loginFun, {
    retry: 0,
    staleTime: 100000,
    onSuccess: (data) => {
      reset()
      queryClient.setQueryData('userInfo', data)
      router.push(pathName)
    },
  })

  useEffect(() => {
    customLocalStorage() && customLocalStorage().userInfo && router.push('/')
  }, [router])

  const submitHandler = async (data) => {
    mutateAsync(data)
  }

  return (
    <div className='login_page'>
      <Head>
        <title>Login</title>
        <meta property='og:title' content='Login' key='title' />
      </Head>

      <h3 className=''>Sign In</h3>
      {isError && <Message variant='danger'>{error}</Message>}

      <form onSubmit={handleSubmit(submitHandler)}>
        {inputEmail({ register, errors, label: 'Email', name: 'email' })}
        {inputPassword({
          register,
          errors,
          label: 'Password',
          name: 'password',
        })}

        <div className='btn-group'>
          <button
            type='submit'
            className='btn btn-outline-primary form-control'
            disabled={isLoading}
          >
            {isLoading ? (
              <span className='spinner-border spinner-border-sm' />
            ) : (
              'Sign In'
            )}
          </button>

          <Link href='/register' type='submit'>
            <a className='btn btn-primary form-control ms-2'>Register</a>
          </Link>
        </div>
      </form>
      <div className='row pt-3 forgot'>
        <div className='col-12'>
          <Link href='/forgot'>
            <a className='ps-1 text-decoration-none '> Forgot Password?</a>
          </Link>
        </div>
      </div>
      <div className='row mt-5'>
        <div className='col-lg-4 col-md-6 col-12 mx-auto text-center'>
          <a href='https://www.websom.dev' target='_blank' rel='noreferrer'>
            {/*  eslint-disable-next-line @next/next/no-img-element */}
            <img src='/logo.png' className='img-fluid w-50' alt='logo' />
          </a>
        </div>

        <div className='col-12 text-center'>
          <ul className='list-group bg-transparent text-light d-flex justify-content-between flex-column border-0 shadow-none'>
            <div>
              <li className='list-group-item '>
                <FaWhatsapp className='text-light fs-4' />
                <a
                  className='text-light text-decoration-none'
                  href='https://wa.me/252615301507'
                >
                  +252 61 530 1507
                </a>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login
