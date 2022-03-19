import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import { receiptOrder, updateReceipt } from '../../api/orders'
import { useMutation, useQueryClient } from 'react-query'
import moment from 'moment'
import { FaDollarSign, FaInfoCircle, FaSearch } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { inputNumber } from '../../utils/dynamicForm'

const Receipt = () => {
  const [receipt, setReceipt] = useState('')
  const [id, setId] = useState(null)
  const queryClient = useQueryClient()
  const {
    data,
    isLoading: isLoadingReceipt,
    isError: isErrorReceipt,
    error: errorReceipt,
    mutateAsync: receiptMutateAsync,
  } = useMutation(receiptOrder, {
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries(['receipt'])
    },
  })

  const orders = data && data.orders
  const transactions = data && data.transactions

  const getRunningBalance = (order) => {
    const trans =
      transactions &&
      transactions.length > 0 &&
      transactions.filter((t) => t.order === order._id)

    const balance =
      trans.length > 0 &&
      trans.reduce(
        (acc, curr) =>
          acc + curr.paidAmount + curr.discountAmount + curr.commissionAmount,
        0
      )
    const runningBalance = balance
      ? order.cost - balance
      : balance || order.cost

    return runningBalance
  }

  const totalCosts =
    orders &&
    orders.length > 0 &&
    orders.reduce((acc, curr) => acc + curr.cost, 0)

  const totalBalances =
    transactions &&
    transactions.length > 0 &&
    transactions.reduce(
      (acc, curr) =>
        acc + curr.paidAmount + curr.discountAmount + curr.commissionAmount,
      0
    )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  })

  const formCleanHandler = () => {
    reset()
  }

  const {
    isLoading: isLoadingUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    isSuccess: isSuccessUpdate,
    mutateAsync: updateMutateAsync,
  } = useMutation(updateReceipt, {
    retry: 0,
    onSuccess: () => {
      reset()
      formCleanHandler()
      queryClient.invalidateQueries(['orders'])
    },
  })

  useEffect(() => {
    if (isSuccessUpdate) {
      receiptMutateAsync(receipt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessUpdate])

  const searchHandler = (e) => {
    e.preventDefault()
    receiptMutateAsync(receipt)
  }

  // const getTotal = (data) => {
  //   const cost =
  //     data && data.reduce((acc, cur) => acc + cur.quantity * cur.price, 0)
  //   return `$${cost.toLocaleString(undefined, {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   })}`
  // }

  const editHandler = (order) => {
    setId(order._id)
  }

  const submitHandler = (data) => {
    updateMutateAsync({
      _id: id,
      data,
    })
  }

  return (
    <div className='mt-3'>
      <div className='row'>
        <div className='col-md-4 col-12 m-auto'>
          <h3 className='fw-bold text-light font-monospace text-center'>
            RECEIPTS
          </h3>
        </div>
      </div>
      <form onSubmit={searchHandler}>
        <div className='d-flex mb-3'>
          <input
            type='number'
            value={receipt}
            name='receipt'
            onChange={(e) => setReceipt(e.target.value)}
            className='form-control'
            placeholder='Receipt by mobile number'
            style={{ flex: '4' }}
            aria-label='Receipt by mobile number'
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

      {isSuccessUpdate && (
        <Message variant='success'>
          Money has been receipted successfully.
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
                Receipt Money
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
              {isLoadingReceipt ? (
                <div className='text-center'>
                  <Loader
                    type='ThreeDots'
                    color='#00BFFF'
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                  />
                </div>
              ) : isErrorReceipt ? (
                <Message variant='danger'>{errorReceipt}</Message>
              ) : (
                <form onSubmit={handleSubmit(submitHandler)}>
                  <div className='row'>
                    <div className='col-md-4 col-12'>
                      {inputNumber({
                        register,
                        errors,
                        label: 'Receipt Money',
                        name: 'receipt',
                      })}
                    </div>
                    <div className='col-md-4 col-12'>
                      {inputNumber({
                        register,
                        errors,
                        label: 'Discount Money',
                        name: 'discount',
                      })}
                    </div>
                    <div className='col-md-4 col-12'>
                      {inputNumber({
                        register,
                        errors,
                        label: 'Commission',
                        name: 'commission',
                      })}
                    </div>

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
                        disabled={isLoadingUpdate}
                      >
                        {isLoadingUpdate ? (
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

      {isLoadingReceipt ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isErrorReceipt ? (
        <Message variant='danger'>{errorReceipt}</Message>
      ) : (
        <>
          <div className='btn-group d-flex'>
            <button className='btn btn-outline-light btn-sm'>
              TOTAL: $
              {totalCosts &&
                totalCosts.toLocaleString({
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </button>
            <button className='btn btn-outline-danger btn-sm'>
              $
              {totalBalances &&
                totalCosts &&
                (totalCosts - totalBalances).toLocaleString({
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </button>
          </div>

          <div className='row gy-3 mt-3'>
            {orders &&
              orders.map((order) => (
                <div
                  key={order._id}
                  className={
                    getRunningBalance(order) !== 0
                      ? 'text-danger col-md-6 col-12'
                      : 'col-md-6 col-12'
                  }
                >
                  <div className='card position-relative py-0'>
                    <div className='card-body py-1'>
                      <div className='card-text text-center'>
                        <span className='fw-bold text-primary'>
                          {order._id}
                        </span>
                        <br />
                        <span className='fw-bold text-primary'>
                          {order.fullName}
                        </span>
                        <br />
                        <span className=''>{order.mobileNumber}</span> <br />
                        <span className='text-primary'>
                          {order.items} items - ${order.cost.toFixed(2)}
                        </span>
                        <br />
                        <span className=''>
                          {moment(order.createdAt).format('lll')}
                        </span>{' '}
                        <br />${getRunningBalance(order).toFixed(2)} Running
                        Balance
                      </div>
                    </div>

                    {getRunningBalance(order) !== 0 && (
                      <FaDollarSign
                        onClick={() => editHandler(order)}
                        data-bs-toggle='modal'
                        data-bs-target='#editOrderModal'
                        className='me-1 text-danger fs-2 position-absolute'
                        style={{ bottom: '5', right: '20' }}
                      />
                    )}

                    <Link href={`/orders/${order._id}`}>
                      <a>
                        <FaInfoCircle
                          onClick={() => editHandler(order)}
                          className='me-1 text-primary fs-2 position-absolute'
                          style={{ bottom: '5', left: '30' }}
                        />
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Receipt)), { ssr: false })
