import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'
import { FaFileDownload, FaTimesCircle, FaSearch } from 'react-icons/fa'
import useReports from '../api/reports'
import { CSVLink } from 'react-csv'
import moment from 'moment'

const Activities = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { searchTransactions, deleteTransaction } = useReports(page)

  const { isLoading, isError, error, isSuccess, mutateAsync, data } =
    searchTransactions

  const { mutateAsync: deleteMutateAsync, isSuccess: isSuccessDelete } =
    deleteTransaction

  const searchHandler = (e) => {
    e.preventDefault()
    mutateAsync(search)
    setPage(1)
  }

  useEffect(() => {
    if (isSuccessDelete) {
      mutateAsync(search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete])

  const getOldBalance = (items) => {
    const total = items.orderItems.reduce(
      (acc, curr) => acc + curr.quantity * curr.price,
      0
    )
    return total
  }

  const forExcel =
    data &&
    data.map((d) => ({
      Customer: d.customerName,
      Mobile: d.customerMobile,
      PreviousAmount: d.prevAmount,
      PaidAmount: d.paidAmount,
      CommissionAmount: d.commissionAmount,
      DiscountAmount: d.discountAmount,
      RunningBalance: `-$${(
        d.prevAmount -
        (d.paidAmount + d.discountAmount + d.commissionAmount)
      ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      DateTime: moment(d.createdAt).format('lll'),
      receiptBy: d.receiptBy && d.receiptBy.name,
    }))

  useEffect(() => {
    if (search || isSuccessDelete) {
      mutateAsync(search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isSuccessDelete])

  const deleteHandler = (id) => {
    deleteMutateAsync(id)
  }

  return (
    <>
      <Head>
        <title>Transaction</title>
        <meta property='og:title' content='Transaction' key='title' />
      </Head>
      {isSuccess && page <= 1 && (
        <Message variant='success'>
          Transaction has been fetched successfully.
        </Message>
      )}
      {isError && <Message variant='danger'>{error}</Message>}

      <div className='position-relative'>
        <CSVLink
          data={data && data ? forExcel : []}
          filename='transactions.csv'
        >
          <button
            className='btn btn-success position-fixed rounded-3 animate__bounceIn'
            style={{
              bottom: '20px',
              right: '20px',
            }}
          >
            <FaFileDownload className='mb-1' />
          </button>
        </CSVLink>
      </div>

      <div className='row'>
        <div className='col-md-4 col-12 m-auto'>
          <h3 className='fw-bold text-light font-monospace text-center'>
            TRANSACTIONS
          </h3>
        </div>

        <div className='col-md-4 col-12 ms-auto'>
          <form onSubmit={searchHandler}>
            <div className='d-flex mb-3'>
              <input
                type='text'
                value={search}
                name='search'
                onChange={(e) => setSearch(e.target.value)}
                className='form-control'
                placeholder='Search by order ID'
                style={{ flex: '4' }}
                aria-label='Search by order ID'
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
          {!isLoading && data && (
            <button className='btn btn-outline-light btn-sm'>
              {data.length} records were found
            </button>
          )}

          {data &&
            data.map((employee, index) => (
              <div
                key={index}
                className='card text-dark my-2 position-relative'
              >
                <div className='card-body'>
                  <div className='d-flex justify-content-between flex-column'>
                    <span>
                      <strong>Order Amount: </strong> $
                      {employee.order &&
                        getOldBalance(employee.order).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                    </span>
                    <span>
                      <strong>Paid Amount: </strong> $
                      {employee.paidAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span>
                      <strong>Discount Amount: </strong> $
                      {employee.paidAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span>
                      {' '}
                      $
                      {employee.commissionAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {employee.quantity}
                    </span>
                    <span>
                      <strong>Paid At: </strong>{' '}
                      {moment(employee.createdAt).format('lll')}
                    </span>
                    <span>
                      <strong>Cashier: </strong>{' '}
                      {employee.receiptBy && employee.receiptBy.name}
                    </span>
                  </div>
                  <FaTimesCircle
                    onClick={() => deleteHandler(employee._id)}
                    className='me-1 text-danger fs-2 position-absolute'
                    style={{ bottom: '5', right: '20' }}
                  />
                </div>
              </div>
            ))}
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Activities)), {
  ssr: false,
})
