import { Layout } from '@/components/dom/Layout'
import '@/global.css'

export const metadata = {
  title: 'Neuroxones',
  description: 'A smart hearing concept.',
  keywords: '3D Web Development, Software Engineer, Product Manager, Project Manager, Data Scientist, Computer Scientist',
  authors: [{ name: 'Lagooneration' }],
  openGraph: {
    title: 'Neuroxones',
    description: 'A smart hearing concept.',
    url: 'https://neuroxones.com/',
    siteName: 'Neuroxones',
    images: [
      {
        url: '/icons/share.png',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    site: '@neuroxones',
  },
  icons: {
    icon: '/icons/favicon-32x32.png',
    shortcut: '/icons/apple-touch-icon.png',
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json'
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
