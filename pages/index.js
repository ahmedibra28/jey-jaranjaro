import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'

import { addOrder, getOrders, updateOrder, deleteOrder } from '../api/orders'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { confirmAlert } from 'react-confirm-alert'
import { Confirm } from '../components/Confirm'
import { useForm } from 'react-hook-form'
import Pagination from '../components/Pagination'
import { inputNumber, inputText } from '../utils/dynamicForm'
import moment from 'moment'
import {
  FaEdit,
  FaPlus,
  FaPlusCircle,
  FaTimesCircle,
  FaSearch,
} from 'react-icons/fa'
import Spinner from '../components/Spinner'

function Home() {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [search, setSearch] = useState('')
  // const [files, setFiles] = useState([])
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery(
    'orders',
    () => getOrders(page, search),
    {
      retry: 0,
    }
  )

  const getTotal = (data) => {
    const cost =
      data && data.reduce((acc, cur) => acc + cur.quantity * cur.price, 0)
    return `$${cost.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const {
    isLoading: isLoadingAdd,
    isError: isErrorAdd,
    error: errorAdd,
    isSuccess: isSuccessAdd,
    mutateAsync: addMutateAsync,
  } = useMutation(addOrder, {
    retry: 0,
    onSuccess: () => {
      reset()
      setEdit(false)
      formCleanHandler()
      queryClient.invalidateQueries(['orders'])
    },
  })

  const searchHandler = (e) => {
    e.preventDefault()

    const refetch = async () => {
      await queryClient.prefetchQuery('orders')
    }
    if (search) {
      refetch()
    }
  }

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = useMutation(updateOrder, {
    retry: 0,
    onSuccess: () => {
      reset()
      formCleanHandler()
      setEdit(false)
      queryClient.invalidateQueries(['orders'])
    },
  })

  const {
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
    error: errorDelete,
    isSuccess: isSuccessDelete,
    mutateAsync: deleteMutateAsync,
  } = useMutation(deleteOrder, {
    retry: 0,
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  })

  const [inputFields, setInputFields] = useState([
    {
      item: '',
      quantity: 0,
      price: 0,
      description: '',
    },
  ])

  const formCleanHandler = () => {
    setEdit(false)
    setInputFields([
      {
        item: '',
        quantity: 0,
        price: 0,
        description: '',
      },
    ])
    reset()
  }

  const deleteHandler = (id) => {
    confirmAlert(Confirm(() => deleteMutateAsync(id)))
  }

  const submitHandler = (data) => {
    const formData = {
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      inputFields: JSON.stringify(inputFields),
    }

    edit
      ? updateMutateAsync({
          _id: id,
          formData,
        })
      : addMutateAsync(formData)
  }

  const editHandler = (order) => {
    // setFiles(order.files && order.files)
    setId(order._id)
    setValue('fullName', order.fullName)
    setValue('mobileNumber', order.mobileNumber)
    setInputFields(order.orderItems)
    setEdit(true)
  }

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      {
        item: '',
        quantity: 0,
        price: 0,
        description: '',
      },
    ])
  }

  const handleRemoveField = (index) => {
    const list = [...inputFields]
    list.splice(index, 1)
    setInputFields(list)
  }

  const handleInputChange = (e, index) => {
    const { name, value } = e.target
    const old = inputFields[index]
    const updated = { ...old, [name]: value }
    var list = [...inputFields]
    list[index] = updated
    setInputFields(list)
  }

  useEffect(() => {
    const refetch = async () => {
      await queryClient.prefetchQuery('orders')
    }
    refetch()
  }, [page, queryClient])

  return (
    <div>
      <Head>
        <title>Jey Jaran-Jaro</title>
        <meta property='og:title' content='Jey Jaran-Jaro' key='title' />
      </Head>
      {isSuccessAdd && (
        <Message variant='success'>
          Order has been Created successfully.
        </Message>
      )}
      {isErrorAdd && <Message variant='danger'>{errorAdd}</Message>}
      {isSuccessDelete && (
        <Message variant='success'>
          Order has been deleted successfully.
        </Message>
      )}
      {isErrorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {isSuccessUpdate && (
        <Message variant='success'>
          Order has been updated successfully.
        </Message>
      )}
      {isErrorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

      <div
        className='modal fade'
        id='editOrderModal'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
        tabIndex='-1'
        aria-labelledby='editOrderModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog modal-xl'>
          <div className='modal-content modal-background'>
            <div className='modal-header'>
              <h3 className='modal-title ' id='editOrderModalLabel'>
                {edit ? 'Edit Order' : 'Add New Order'}
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
                  <div className='row'>
                    <div className='col-md-8 col-12'>
                      {inputText({
                        register,
                        errors,
                        label: 'Full Name',
                        name: 'fullName',
                      })}
                    </div>
                    <div className='col-md-4 col-12'>
                      {inputNumber({
                        register,
                        errors,
                        label: 'Mobile Number',
                        name: 'mobileNumber',
                      })}
                    </div>
                    {/* <div className='col-md-4 col-12'>
                     {inputFile({
                        register,
                        errors,
                        label: edit
                          ? `${files && files.length} files`
                          : 'Upload File',
                        name: 'file',
                        isRequired: false,
                      })} 
                     {edit &&
                        files &&
                        files.map((f) => (
                          <span key={f.fullFileName}>{f.fullFileName},</span>
                        ))} 
                    </div> */}
                    <hr />
                    {inputFields.map((inputField, index) => (
                      <div key={index}>
                        <div className='row '>
                          <div className='col-md-6 col-12'>
                            <label htmlFor='item' className='form-label'>
                              Item
                            </label>
                            <input
                              type='text'
                              className='form-control'
                              placeholder='Item'
                              name='item'
                              id='item'
                              value={inputField.item}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='quantity' className='form-label'>
                              Quantity
                            </label>
                            <input
                              type='number'
                              className='form-control'
                              placeholder='Item'
                              name='quantity'
                              id='quantity'
                              value={inputField.quantity}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-md-3 col-6'>
                            <label htmlFor='price' className='form-label'>
                              Price
                            </label>
                            <input
                              type='number'
                              step={0.01}
                              className='form-control'
                              placeholder='Item'
                              name='price'
                              id='price'
                              value={inputField.price}
                              required
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='col-12'>
                            <label htmlFor='description' className='form-label'>
                              Description
                            </label>
                            <textarea
                              type='text'
                              className='form-control'
                              placeholder='Item'
                              name='description'
                              id='description'
                              value={inputField.description}
                              onChange={(e) => handleInputChange(e, index)}
                            />
                          </div>
                          <div className='ms-auto col-3'>
                            <div className='my-3'>
                              <div className='d-flex flex-column'>
                                {inputFields.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveField(index)}
                                    type='button'
                                    className='btn btn-outline-danger btn-sm'
                                  >
                                    <FaTimesCircle className='mb-1' />
                                  </button>
                                )}
                                {inputFields.length - 1 === index && (
                                  <button
                                    onClick={() => handleAddField()}
                                    type='button'
                                    className='btn btn-outline-primary btn-sm'
                                  >
                                    <FaPlusCircle className='mb-1' />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr />
                      </div>
                    ))}
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
            top: '5px',
            right: '20px',
          }}
          data-bs-toggle='modal'
          data-bs-target='#editOrderModal'
        />
      </div>

      <div className='row'>
        <div className='col-md-4 col-12 m-auto'>
          <h3 className='fw-bold text-light font-monospace text-center'>
            ORDERS
          </h3>
        </div>
        <div className='col-md-4 col-12 m-auto text-center'>
          <Pagination data={data} setPage={setPage} />
        </div>

        <div className='col-md-4 col-12 m-auto mt-1'>
          <form onSubmit={searchHandler}>
            <div className='d-flex'>
              <input
                type='text'
                value={search}
                name='search'
                onChange={(e) => (setSearch(e.target.value), setPage(1))}
                className='form-control'
                placeholder='Search by mobile number'
                style={{ flex: '4' }}
                aria-label='Search by mobile number'
                aria-describedby='basic-addon2'
              />
              <button
                style={{ flex: '1' }}
                className='btn btn-primary input-group-text'
                id='basic-addon2'
              >
                <FaSearch className='mb-1' />
              </button>
            </div>
          </form>
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
          <div className='row gy-3 mt-3'>
            {data &&
              data.data &&
              data.data.map((order) => (
                <div key={order._id} className='col-md-6 col-12'>
                  <div className='card position-relative py-0'>
                    <div className='card-body py-1'>
                      <div className='card-text text-center'>
                        <Link
                          href={`/orders/${order._id}`}
                          className='text-decoration-none'
                        >
                          <span className='fw-bold text-primary text-uppercase'>
                            {order.fullName}
                          </span>
                        </Link>
                        <br />
                        <span className=''>{order.mobileNumber}</span> <br />
                        <span className='text-primary'>
                          {order.orderItems.length} items -{' '}
                          {getTotal(order.orderItems)}
                        </span>
                        <br />
                        <span className=''>
                          {moment(order.createdAt).format('lll')}
                        </span>
                      </div>
                    </div>

                    <FaTimesCircle
                      onClick={() => deleteHandler(order._id)}
                      disabled={isLoadingDelete}
                      className='me-1 text-danger fs-2 position-absolute'
                      style={{ bottom: '5', right: '20' }}
                    />
                    <FaEdit
                      onClick={() => editHandler(order)}
                      data-bs-toggle='modal'
                      data-bs-target='#editOrderModal'
                      className='me-1 text-primary fs-2 position-absolute'
                      style={{ bottom: '5', left: '30' }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div>Test</div>
        </>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Home)), { ssr: false })
