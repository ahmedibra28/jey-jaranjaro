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

  // console.log(transactions && transactions)

  // const getBalance = (order) => {
  //   const trans =
  //     transactions &&
  //     transactions.length > 0 &&
  //     transactions.filter((t) => t.order === order)

  //   const balance =
  //     trans &&
  //     trans.length > 0 &&
  //     trans.reduce(
  //       (acc, curr) =>
  //         acc + curr.paidAmount + curr.discountAmount + curr.commissionAmount,
  //       0
  //     )
  //   return balance
  // }

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
      <form onSubmit={searchHandler}>
        <div className='input-group mb-3'>
          <input
            type='text'
            value={receipt}
            name='receipt'
            onChange={(e) => setReceipt(e.target.value)}
            className='form-control'
            placeholder='Receipt by mobile number'
            aria-label='Receipt by mobile number'
            aria-describedby='basic-addon2'
          />
          <button
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
                        className='btn btn-primary '
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
          <div className='table-responsive '>
            <table className='table table-sm hover bordered table-striped caption-top'>
              <caption>{orders ? orders.length : 0} records were found</caption>
              <thead>
                <tr>
                  <th>REF</th>
                  <th>CUSTOMER</th>
                  <th>MOBILE</th>
                  <th>DATE</th>
                  <th>NO. OF ITEMS</th>
                  <th>COST</th>
                  <th>BALANCE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders &&
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td> {order._id}</td>
                      <td>{order.fullName}</td>
                      <td>{order.mobileNumber}</td>
                      <td>{moment(order.createdAt).format('lll')}</td>
                      <td>{order.items} items</td>
                      <td>${order.cost.toFixed(2)}</td>
                      <td
                        className={
                          getRunningBalance(order) !== 0 ? 'text-danger' : ''
                        }
                      >
                        ${getRunningBalance(order).toFixed(2)}
                      </td>
                      <td className='btn-group'>
                        <button
                          disabled={getRunningBalance(order) === 0}
                          className='btn btn-primary btn-sm rounded-pill ms-1'
                          onClick={() => editHandler(order)}
                          data-bs-toggle='modal'
                          data-bs-target='#editOrderModal'
                        >
                          <FaDollarSign />
                        </button>

                        <Link href={`/orders/${order._id}`}>
                          <a className='btn btn-success btn-sm rounded-pill ms-1'>
                            <FaInfoCircle />
                          </a>
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className='fw-bold'>
                <tr>
                  <td colSpan={4}></td>
                  <td>Total</td>
                  <td>
                    $
                    {totalCosts &&
                      totalCosts.toLocaleString({
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </td>
                  <td className='text-danger'>
                    $
                    {totalBalances &&
                      totalCosts &&
                      (totalCosts - totalBalances).toLocaleString({
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Receipt)), { ssr: false })
