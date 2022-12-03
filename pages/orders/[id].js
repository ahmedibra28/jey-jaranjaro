import React, { useRef } from 'react'
import { useRouter } from 'next/router'
import { getOrderDetail } from '../../api/orders'
import { useQuery } from 'react-query'
import Message from '../../components/Message'

import moment from 'moment'
import { FaArrowCircleLeft, FaPrint } from 'react-icons/fa'
import { useReactToPrint } from 'react-to-print'
import Spinner from '../../components/Spinner'

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
          <Spinner />
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
                  className='btn btn-primary btn-sm'
                >
                  <FaArrowCircleLeft className='mb-1' /> Go Back
                </button>
                <button
                  onClick={handlePrint}
                  type='submit'
                  className='btn btn-outline-primary rounded-pill '
                >
                  <FaPrint className='mb-1' />
                  Print
                </button>
              </div>
              <h4 className='text-center fw-bold text-light my-2'>
                ORDER DETAILS
              </h4>
              <hr />
              <div ref={componentRef}>
                <div className='border border-secondary'>
                  <div className='d-flex justify-content-around shadow p-2 rounded-3 bg-light text-dark'>
                    <div className='customer'>
                      <span className='fw-bold'>Customer: </span>
                      <br />
                      <span> {data.fullName}</span>
                    </div>
                    <div className='mobile'>
                      <span className='fw-bold'>Mobile: </span>
                      <br />
                      <span> {data.mobileNumber}</span>
                    </div>
                  </div>
                  <hr />
                  <div className='d-flex justify-content-around shadow p-2 rounded-3 bg-light text-dark'>
                    <div className='date'>
                      <span className='fw-bold'>Date: </span>
                      <br />
                      <span> {moment(data.createdAt).format('MMM Do YY')}</span>
                    </div>
                    <div className='approved'>
                      <span className='fw-bold'>Approved: </span>
                      <br />
                      <span> {data.user.name}</span>
                    </div>
                  </div>
                </div>
                <hr />

                <div className='d-flex justify-content-between'>
                  <button className='btn btn-outline-light btn-sm'>
                    {data.orderItems.reduce(
                      (acc, cur) => acc + cur.quantity,
                      0
                    )}{' '}
                    items
                  </button>
                  <button className='btn btn-outline-light btn-sm'>
                    $
                    {data.orderItems
                      .reduce((acc, cur) => acc + cur.price, 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                  </button>
                  <button className='btn btn-outline-light btn-sm'>
                    $
                    {data.orderItems
                      .reduce((acc, cur) => acc + cur.quantity * cur.price, 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </button>
                </div>
                {data.orderItems.map((item, index) => (
                  <div key={index} className='card text-dark my-2'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between flex-column'>
                        <span>
                          <strong>Item: </strong> {item.item}
                        </span>
                        <span>
                          <strong>Quantity: </strong> {item.quantity}
                        </span>
                        <span>
                          <strong>Price: </strong> $
                          {item.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span>
                          <strong>Total: </strong> $
                          {(item.price * item.quantity).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                      <p className='mt-2'>
                        <strong>Description: </strong> {item.description}
                      </p>
                    </div>
                  </div>
                ))}

                <div className='row'>
                  {data &&
                    data.files &&
                    data.files.map((item, index) => (
                      <div key={index} className='col-md-6 col-12'>
                        {/*  eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.filePath}
                          alt={item.fullFileName}
                          className='img-fluid'
                        />
                      </div>
                    ))}
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
