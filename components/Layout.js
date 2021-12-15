import Navigation from './Navigation'
import Head from 'next/head'
import Canvas from './Canvas'
import { FaBars } from 'react-icons/fa'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Jey Jaranjaro</title>
        <meta property='og:title' content='Jey Jaranjaro' key='title' />
      </Head>
      <Navigation />
      <Canvas />
      <div className='container'>{children}</div>
    </>
  )
}
