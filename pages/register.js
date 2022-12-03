import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Message from '../components/Message'

import { registerUser } from '../api/users'
import { useMutation } from 'react-query'

import { useForm } from 'react-hook-form'
import { customLocalStorage } from '../utils/customLocalStorage'
import Head from 'next/head'
import { inputEmail, inputPassword, inputText } from '../utils/dynamicForm'

const Register = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      admin: false,
      user: false,
    },
  })

  const { isLoading, isError, error, isSuccess, mutateAsync } = useMutation(
    'registerUser',
    registerUser,
    {
      retry: 0,
      onSuccess: () => {
        reset()
        router.push('/')
      },
    }
  )

  useEffect(() => {
    customLocalStorage() && customLocalStorage().userInfo && router.push('/')
  }, [router])

  const submitHandler = (data) => {
    mutateAsync(data)
  }
  return (
    <div className='register_page'>
      <Head>
        <title>Sign up</title>
        <meta property='og:title' content='Signup' key='title' />
      </Head>
      <h3 className=''>Sign Up</h3>
      {isSuccess && (
        <Message variant='success'>User has registered successfully</Message>
      )}

      {isError && <Message variant='danger'>{error}</Message>}
      <form onSubmit={handleSubmit(submitHandler)}>
        {inputText({ register, errors, label: 'Name', name: 'name' })}
        {inputEmail({ register, errors, label: 'Email', name: 'email' })}
        {inputPassword({
          register,
          errors,
          label: 'Password',
          name: 'password',
          isRequired: true,
          minLength: true,
        })}

        {inputPassword({
          register,
          errors,
          watch,
          name: 'confirmPassword',
          label: 'Confirm Password',
          validate: true,
          minLength: true,
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
              'Sign Up'
            )}
          </button>

          <Link
            href='/login'
            type='submit'
            className='btn btn-primary form-control ms-2'
          >
            Login
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Register
