import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const Pagination = ({ data, setPage }) => {
  return data ? (
    <div className='text-center my-1'>
      <span className='btn btn-sm p-2 btn-outline-light'>
        {data.startIndex} - {data.endIndex} of {data.total}
      </span>
      <span
        onClick={() => setPage(data.page - 1)}
        className={`btn btn-sm py-2 px-3 btn-outline-dark mx-1 ${
          data.page === 1 && 'disabled'
        }`}
      >
        <FaChevronLeft className='mb-1' />
      </span>
      <span
        onClick={() => setPage(data.page + 1)}
        className={`btn btn-sm py-2 px-3 btn-light ${
          data.page === data.pages && 'disabled'
        }`}
      >
        <FaChevronRight className='mb-1' />
      </span>
    </div>
  ) : null
}

export default Pagination
