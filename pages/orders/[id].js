import React, { useRef } from 'react'
import { useRouter } from 'next/router'
import { getOrderDetail } from '../../api/orders'
import { useQuery } from 'react-query'
import Message from '../../components/Message'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import { FaArrowCircleLeft, FaPrint } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print'

const Detail = () => {
  const router = useRouter()
  const { id } = router.query

  const { data, isLoading, isError, error } = useQuery(
    'order',
    () => getOrderDetail(id),
    {
      retry: 0,
      enabled: !!id,
    }
  )

  const componentRef = useRef()
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Order Invoice',
  })

  return (
    <div>
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
        data && (
          <div className='row'>
            <div className='col-md-9 col-12 mx-auto text-secondary mt-3'>
              <div className='d-flex justify-content-between'>
                <button
                  onClick={() => router.back()}
                  className='btn btn-primary btn-sm rounded-pill'
                >
                  <FaArrowCircleLeft className='mb-1' /> Go Back
                </button>
                <button
                  onClick={handlePrint}
                  type='submit'
                  className='btn btn-primary rounded-pill '
                >
                  <FaPrint className='mb-1' />
                  Print
                </button>
                <h4 className='text-center'>Order Details</h4>
              </div>
              <hr />
              <div ref={componentRef}>
                <div className='border border-secondary p-3'>
                  <div className='d-flex justify-content-between'>
                    <div className='customer'>
                      <span className='fw-bold'>Customer: </span>{' '}
                      <span> {data.fullName}</span>
                    </div>
                    <div className='mobile'>
                      <span className='fw-bold'>Mobile Number: </span>{' '}
                      <span> {data.mobileNumber}</span>
                    </div>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-between'>
                    <div className='date'>
                      <span className='fw-bold'>Date: </span>{' '}
                      <span> {moment(data.createdAt).format('MMM Do YY')}</span>
                    </div>
                    <div className='approved'>
                      <span className='fw-bold'>Approved: </span>{' '}
                      <span> {data.user.name}</span>
                    </div>
                    <div className='total'>
                      <span className='fw-bold'>Total: </span>{' '}
                      <span>
                        $
                        {data.orderItems
                          .reduce(
                            (acc, cur) => acc + cur.quantity * cur.price,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>{' '}
                </div>
                <hr />
                <div className='table-responsive'>
                  <table className='table table-bordered border-secondary text-secondary'>
                    <thead>
                      <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>Item</th>
                        <th scope='col'>Quantity</th>
                        <th scope='col'>Price</th>
                        <th scope='col'>Total</th>
                        <th scope='col'>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orderItems.map((item, index) => (
                        <tr key={item._id}>
                          <th scope='row'>{index + 1}</th>
                          <td>{item.item}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                          <td>{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan='2' className='text-center'>
                          Total
                        </td>
                        <td>
                          {data.orderItems.reduce(
                            (acc, cur) => acc + cur.quantity,
                            0
                          )}
                        </td>
                        <td>
                          $
                          {data.orderItems
                            .reduce((acc, cur) => acc + cur.price, 0)
                            .toFixed(2)}{' '}
                        </td>
                        <td colSpan='2'>
                          $
                          {data.orderItems
                            .reduce(
                              (acc, cur) => acc + cur.quantity * cur.price,
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default Detail
