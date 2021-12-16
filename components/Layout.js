import Navigation from './Navigation'
import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Jey Jaranjaro</title>
        <meta property='og:title' content='Jey Jaranjaro' key='title' />
      </Head>
      <Navigation />
      <div className='container'>{children}</div>
    </>
  )
}
