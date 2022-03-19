import { useEffect } from 'react'
import '../styles/globals.scss'
import '../styles/bootstrap.min.scss'
// import 'bootstrap/dist/css/bootstrap.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import Layout from '../components/Layout'

import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    typeof document !== undefined
      ? require('bootstrap/dist/js/bootstrap')
      : null
  }, [])
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default MyApp
