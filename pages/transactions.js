import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import withAuth from '../HOC/withAuth'
import Message from '../components/Message'
import Loader from 'react-loader-spinner'
import { FaFileDownload } from 'react-icons/fa'
import useReports from '../api/reports'
import { CSVLink } from 'react-csv'
import moment from 'moment'
import Pagination from '../components/Pagination'

const Activities = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { searchTransactions } = useReports(page)

  const { isLoading, isError, error, isSuccess, mutateAsync, data } =
    searchTransactions

  const searchHandler = (e) => {
    e.preventDefault()
    mutateAsync(search)
    setPage(1)
  }

  const forExcel =
    data &&
    data.data.map((d) => ({
      Customer: d.customerName,
      Mobile: d.customerMobile,
      PreviousAmount: d.prevAmount,
      PaidAmount: d.paidAmount,
      DiscountAmount: d.discountAmount,
      RunningBalance: `-$${(
        d.prevAmount -
        (d.paidAmount + d.discountAmount)
      ).toFixed(2)}`,
      DateTime: moment(d.createdAt).format('lll'),
      receiptBy: d.receiptBy && d.receiptBy.name,
    }))

  useEffect(() => {
    if (search) {
      mutateAsync(search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

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
          data={data && data.data ? forExcel : []}
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

      <div className='row mt-3'>
        <div className='col-md-4 col-6 me-auto'>
          <h3 className='fw-light font-monospace'>Transactions</h3>
        </div>
        <div className='col-md-4 col-6 m-auto'>
          <Pagination data={data && data} setPage={setPage} />
        </div>

        <div className='col-md-4 col-12 ms-auto'>
          <form onSubmit={(e) => searchHandler(e)}>
            <input
              type='number'
              className='form-control py-2'
              placeholder='Search by ID or Name'
              name='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              <caption>
                {!isLoading && data ? data.total : 0} records were found
              </caption>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  {/* <th>Mobile Number</th> */}
                  <th>Prev Amount</th>
                  <th>Paid Amount</th>
                  <th>Discount Amount</th>
                  <th>Running Balance</th>
                  <th>DateTime</th>
                  <th>Receipted</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.data.map((employee) => (
                    <tr key={employee._id}>
                      <td>{employee.customerName}</td>
                      <td>${employee.prevAmount.toFixed(2)}</td>
                      <td>${employee.paidAmount.toFixed(2)}</td>
                      <td>${employee.discountAmount.toFixed(2)}</td>
                      <td>
                        {`-$${(
                          employee.prevAmount -
                          (employee.paidAmount + employee.discountAmount)
                        ).toFixed(2)}`}
                      </td>
                      <td>{moment(employee.createdAt).format('lll')}</td>
                      <td>{employee.receiptBy && employee.receiptBy.name}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Activities)), {
  ssr: false,
})
