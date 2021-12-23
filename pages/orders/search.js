import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import withAuth from '../../HOC/withAuth'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import { searchOrder } from '../../api/orders'
import { useMutation, useQueryClient } from 'react-query'
import moment from 'moment'
import { FaInfoCircle, FaSearch } from 'react-icons/fa'

const Search = () => {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const {
    data,
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
    error: errorSearch,
    mutateAsync: searchMutateAsync,
  } = useMutation(searchOrder, {
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries(['search'])
    },
  })

  const submitHandler = (e) => {
    e.preventDefault()
    searchMutateAsync(search)
  }

  return (
    <div className='mt-3'>
      <form onSubmit={submitHandler}>
        <div className='input-group mb-3'>
          <input
            type='text'
            value={search}
            name='search'
            onChange={(e) => setSearch(e.target.value)}
            className='form-control'
            placeholder='Search by mobile number'
            aria-label='Search by mobile number'
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

      {isLoadingSearch ? (
        <div className='text-center'>
          <Loader
            type='ThreeDots'
            color='#00BFFF'
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      ) : isErrorSearch ? (
        <Message variant='danger'>{errorSearch}</Message>
      ) : (
        <>
          <div className='table-responsive '>
            <table className='table table-sm hover bordered striped caption-top '>
              <caption>{data && data.length} records were found</caption>
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>MOBILE</th>
                  <th>DATE</th>
                  <th>NO. OF ITEMS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((order) => (
                    <tr key={order._id}>
                      <td>{order.fullName}</td>
                      <td>{order.mobileNumber}</td>
                      <td>{moment(order.createdAt).format('llll')}</td>
                      <td>{order.orderItems.length} items</td>
                      <td className='btn-group'>
                        <Link href={`/orders/${order._id}`}>
                          <a className='btn btn-success btn-sm'>
                            <FaInfoCircle className='mb-1' /> Details
                          </a>
                        </Link>
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

export default dynamic(() => Promise.resolve(withAuth(Search)), { ssr: false })
