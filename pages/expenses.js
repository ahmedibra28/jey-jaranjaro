import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'

import moment from 'moment'
import { FaFileDownload, FaPlus, FaTimesCircle, FaEdit } from 'react-icons/fa'

import useExpenses from '../api/expenses'

import { CSVLink } from 'react-csv'

import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../components/Confirm'
import { useForm } from 'react-hook-form'
import { inputNumber, inputText, inputTextArea } from '../utils/dynamicForm'
import Spinner from '../components/Spinner'

const Expense = () => {
  const { getExpenses, updateExpense, addExpense, deleteExpense } =
    useExpenses()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      isActive: true,
    },
  })

  const { data, isLoading, isError, error } = getExpenses

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = updateExpense

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = deleteExpense

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    mutateAsync: addMutateAsync,
  } = addExpense

  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)

  const formCleanHandler = () => {
    setEdit(false)
    reset()
  }

  useEffect(() => {
    if (isSuccessAdd || isSuccessUpdate) formCleanHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessAdd, isSuccessUpdate])

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteMutateAsync(id)))
  }

  const submitHandler = async (data) => {
    edit
      ? updateMutateAsync({
          _id: id,
          name: data.name,
          description: data.description,
          expense: data.expense,
          isActive: data.isActive,
        })
      : addMutateAsync(data)
  }

  const editHandler = (expense) => {
    setId(expense._id)
    setEdit(true)
    setValue('name', expense.name)
    setValue('description', expense.description)
    setValue('expense', expense.expense)
    setValue('isActive', expense.isActive)
  }

  return (
    <>
      <Head>
        <title>Expense</title>
        <meta property='og:title' content='Expense' key='title' />
      </Head>
      {isSuccessUpdate && (
        <Message variant='success'>
          Expense has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {isSuccessAdd && (
        <Message variant='success'>
          Expense has been Created successfully.
        </Message>
      )}
      {isErrorAdd && <Message variant='danger'>{errorAdd}</Message>}
      {isSuccessDelete && (
        <Message variant='success'>
          Expense has been deleted successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}

      <div
        className='modal fade'
        id='editExpenseModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editExpenseModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editExpenseModalLabel'>
                {edit ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
                onClick={formCleanHandler}
              ></button>
            </div>
            <div className='modal-body'>
              {isLoading ? (
                <div className='text-center'>
                  <Spinner />
                </div>
              ) : isError ? (
                <Message variant='danger'>{error}</Message>
              ) : (
                <form onSubmit={handleSubmit(submitHandler)}>
                  {inputText({ register, label: 'Name', errors, name: 'name' })}
                  {inputNumber({
                    register,
                    label: 'Expense',
                    errors,
                    name: 'expense',
                  })}
                  {inputTextArea({
                    register,
                    label: 'Description',
                    errors,
                    name: 'description',
                  })}

                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary '
                      data-bs-dismiss='modal'
                      onClick={formCleanHandler}
                    >
                      Close
                    </button>
                    <button
                      type='submit'
                      className='btn btn-outline-primary '
                      disabled={isLoadingAdd || isLoadingUpdate}
                    >
                      {isLoadingAdd || isLoadingUpdate ? (
                        <span className='spinner-border spinner-border-sm' />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='position-relative'>
        <FaPlus
          className='text-light fs-1 bg-primary p-1 position-fixed rounded-3 animate__bounceIn'
          style={{
            top: '20px',
            right: '20px',
          }}
          data-bs-toggle='modal'
          data-bs-target='#editExpenseModal'
        />

        <CSVLink data={data ? data : []} filename='expense.csv'>
          <FaFileDownload
            className='text-light fs-1 bg-success p-1 position-fixed rounded-3 animate__bounceIn me-2'
            style={{
              top: '20px',
              right: '60px',
            }}
          />
        </CSVLink>
      </div>

      <div className='row'>
        <div className='col-md-4 col-12 m-auto'>
          <h3 className='fw-bold text-light font-monospace text-center'>
            EXPENSES
          </h3>
        </div>
      </div>

      {isLoading ? (
        <div className='text-center'>
          <Spinner />
        </div>
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          {!isLoading && data && (
            <button className='btn btn-outline-light btn-sm'>
              {data.length} records were found
            </button>
          )}

          <div className='row gy-3 mt-3'>
            {data &&
              data.map((expense) => (
                <div key={expense._id} className='col-md-6 col-12'>
                  <div className='card position-relative py-0'>
                    <div className='card-body py-1'>
                      <div className='card-text text-center'>
                        <span className='fw-bold text-primary'>
                          {expense.name}
                        </span>
                        <br />
                        <span className=''>
                          ${expense.expense.toFixed(2)}
                        </span>{' '}
                        <br />
                        <span className='text-primary'>
                          {moment(expense.createdAt).format('lll')}
                        </span>
                        <br />
                        <span className=''>{expense.description}</span>
                      </div>
                    </div>

                    <FaTimesCircle
                      onClick={() => deleteHandler(expense._id)}
                      disabled={isLoadingDelete}
                      className='me-1 text-danger fs-2 position-absolute'
                      style={{ bottom: '5', right: '20' }}
                    />
                    <FaEdit
                      onClick={() => editHandler(expense)}
                      data-bs-toggle='modal'
                      data-bs-target='#editExpenseModal'
                      className='me-1 text-primary fs-2 position-absolute'
                      style={{ bottom: '5', left: '30' }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Expense)), {
  ssr: false,
})
