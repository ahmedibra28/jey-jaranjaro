import Navigation from './Navigation'
import Head from 'next/head'
// import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Jey Jaranjaro</title>
        <meta property='og:title' content='Jey Jaranjaro' key='title' />
        <link rel='shortcut icon' href='logo.png' />
      </Head>
      <Navigation />
      <main className='container'>{children}</main>
      {/* <Footer /> */}
      <div className='mb-5 pb-5'></div>
    </>
  )
}
