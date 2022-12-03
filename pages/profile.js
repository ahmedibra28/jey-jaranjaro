import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'

import { useForm } from 'react-hook-form'

import { getUserDetails, updateUserProfile } from '../api/users'
import { useQuery, useMutation } from 'react-query'
import { customLocalStorage } from '../utils/customLocalStorage'
import Head from 'next/head'
import { inputEmail, inputPassword, inputText } from '../utils/dynamicForm'
import Spinner from '../components/Spinner'

const Profile = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const { data, isLoading, isError, error } = useQuery(
    [
      'userDetails',
      customLocalStorage() &&
        customLocalStorage().userInfo &&
        customLocalStorage().userInfo._id,
    ],
    () =>
      getUserDetails(
        customLocalStorage() &&
          customLocalStorage().userInfo &&
          customLocalStorage().userInfo._id
      ),
    {
      retry: 0,
    }
  )

  const {
    isLoading: isLoadingUpdateProfile,
    isError: isErrorUpdateProfile,
    error: errorUpdateProfile,
    isSuccess,
    mutateAsync,
  } = useMutation(
    [
      'updateProfile',
      customLocalStorage() &&
        customLocalStorage().userInfo &&
        customLocalStorage().userInfo._id,
    ],
    updateUserProfile,
    {
      retry: 0,
      onSuccess: () => {
        setValue('password', '')
        setValue('confirmPassword', '')
      },
    }
  )

  useEffect(() => {
    setValue('name', !isLoading ? data && data.name : '')
    setValue('email', !isLoading ? data && data.email : '')
  }, [isLoading, setValue, data])

  const submitHandler = (data) => {
    mutateAsync(data)
  }

  return (
    <div className='profile_page'>
      <Head>
        <title>Profile</title>
        <meta property='og:title' content='Profile' key='title' />
      </Head>
      <h3 className=''>User Profile</h3>
      {isErrorUpdateProfile && (
        <Message variant='danger'>{errorUpdateProfile}</Message>
      )}
      {isError && <Message variant='danger'>{error}</Message>}
      {isSuccess && (
        <Message variant='success'>User has been updated successfully</Message>
      )}
      {isLoading && (
        <div className='text-center'>
          <Spinner />
        </div>
      )}
      <form onSubmit={handleSubmit(submitHandler)}>
        {inputText({ register, errors, label: 'Name', name: 'name' })}

        {inputEmail({
          register,
          errors,
          label: 'Email',
          name: 'email',
        })}
        {inputPassword({
          register,
          errors,
          label: 'Password',
          name: 'password',
          minLength: true,
          isRequired: false,
        })}

        {inputPassword({
          register,
          errors,
          watch,
          name: 'confirmPassword',
          label: 'Confirm Password',
          validate: true,
          minLength: true,
          isRequired: false,
        })}
        <button
          type='submit'
          className='btn btn-outline-primary form-control'
          disabled={isLoadingUpdateProfile}
        >
          {isLoadingUpdateProfile ? (
            <span className='spinner-border spinner-border-sm' />
          ) : (
            'Update'
          )}
        </button>
      </form>
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Profile)), { ssr: false })
