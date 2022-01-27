import { useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'
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
  FaInfoCircle,
  FaPlus,
  FaPlusCircle,
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa'

function Home() {
  const [page, setPage] = useState(1)
  const [id, setId] = useState(null)
  const [edit, setEdit] = useState(false)
  const [search, setSearch] = useState('')
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
    edit
      ? updateMutateAsync({
          _id: id,
          data,
          inputFields,
        })
      : addMutateAsync({ data, inputFields })
  }

  const editHandler = (order) => {
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
        <div className='modal-dialog modal-lg'>
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
                  <Loader
                    type='ThreeDots'
                    color='#00BFFF'
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                  />
                </div>
              ) : isError ? (
                <Message variant='danger'>{error}</Message>
              ) : (
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className='row'>
                    <div className='col-md-6 col-12'>
                      {inputText({
                        register,
                        errors,
                        label: 'Full Name',
                        name: 'fullName',
                      })}
                    </div>
                    <div className='col-md-6 col-12'>
                      {inputNumber({
                        register,
                        errors,
                        label: 'Mobile Number',
                        name: 'mobileNumber',
                      })}
                    </div>
                    <hr />
                    {inputFields.map((inputField, index) => (
                      <div key={index}>
                        <div className='row '>
                          <div className='col-md-6 col-12'>
                            <label htmlFor='item' className='form-label'>
                              Item
                            </label>
                            <input
                              autoFocus
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
                              autoFocus
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
                                    className='btn btn-danger btn-sm'
                                  >
                                    <FaTimesCircle className='mb-1' />
                                  </button>
                                )}
                                {inputFields.length - 1 === index && (
                                  <button
                                    onClick={() => handleAddField()}
                                    type='button'
                                    className='btn btn-primary btn-sm'
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
                        className='btn btn-primary '
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

      <button
        className='btn btn-primary position-fixed rounded-3 animate__bounceIn'
        style={{
          bottom: '20px',
          right: '25px',
        }}
        data-bs-toggle='modal'
        data-bs-target='#editOrderModal'
      >
        <FaPlus className='mb-1' />
      </button>

      <div className='row mt-2'>
        <div className='col-md-4 col-6 m-auto'>
          <h3 className='fw-light font-monospace'>Orders</h3>
        </div>
        <div className='col-md-4 col-6 m-auto'>
          <Pagination data={data} setPage={setPage} />
        </div>

        <div className='col-md-4 col-12 m-auto'>
          <form onSubmit={(e) => searchHandler(e)}>
            <input
              type='text'
              className='form-control py-2'
              placeholder='Search by Passport or Email'
              name='search'
              value={search}
              onChange={(e) => (setSearch(e.target.value), setPage(1))}
              autoFocus
              required
            />
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isError ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <div className='table-responsive '>
            <table className='table table-sm hover bordered table-striped caption-top '>
              <caption>{data && data.total} records were found</caption>
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>MOBILE</th>
                  <th>DATE</th>
                  <th>NO. OF ITEMS</th>
                  <th>COST</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.data.map((order) => (
                    <tr key={order._id}>
                      <td>{order.fullName}</td>
                      <td>{order.mobileNumber}</td>
                      <td>{moment(order.createdAt).format('lll')}</td>
                      <td>{order.orderItems.length} items</td>
                      <td>{getTotal(order.orderItems)}</td>
                      <td className='btn-group'>
                        <Link href={`/orders/${order._id}`}>
                          <a className='btn btn-success btn-sm rounded-pill'>
                            <FaInfoCircle />
                          </a>
                        </Link>
                        <button
                          className='btn btn-primary btn-sm rounded-pill ms-1'
                          onClick={() => editHandler(order)}
                          data-bs-toggle='modal'
                          data-bs-target='#editOrderModal'
                        >
                          <FaEdit />
                        </button>

                        <button
                          className='btn btn-danger btn-sm rounded-pill ms-1'
                          onClick={() => deleteHandler(order._id)}
                          disabled={isLoadingDelete}
                        >
                          {isLoadingDelete ? (
                            <span className='spinner-border spinner-border-sm' />
                          ) : (
                            <span>
                              {' '}
                              <FaTrash />
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Home)), { ssr: false })
