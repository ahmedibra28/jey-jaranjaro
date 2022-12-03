import React from 'react'

const Footer = () => {
  return (
    <footer>
      <div className='container mt-5 pt-5'>
        <div className='row'>
          <div className='col text-center py-3'>
            Copyright &copy;{' '}
            <a href=' https://ahmedibra.com' target='blank'>
              ahmedibra.com
            </a>
          </div>
        </div>
        <div id='watermark'></div>
      </div>
    </footer>
  )
}

export default Footer
