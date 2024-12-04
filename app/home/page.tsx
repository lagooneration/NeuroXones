'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'


const Neuroxones = dynamic(() => import('@/components/canvas/Intro').then((mod) => mod.Neuroxones), { ssr: false })
const NeuroxoneU = dynamic(() => import('@/components/canvas/Intro').then((mod) => mod.NeuroxoneU), { ssr: false })
const Neuroxone = dynamic(() => import('@/components/canvas/Intro').then((mod) => mod.Neuroxone), { ssr: false })

const Logo = dynamic(() => import('@/components/canvas/Intro').then((mod) => mod.Logo), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
    ssr: false,
    loading: () => (
        <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
      </svg>
    </div>
  ),
})

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const CameraAnimation = () => {
  const { camera } = useThree()
  const targetPosition = new Vector3(0, 0, 4)
  
  useFrame(() => {
    camera.position.lerp(targetPosition, 0.02)
  })
  
  return null
}

export default function Page() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
    <div className="h-screen w-full bg-black">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute z-10 w-full pt-20 text-center text-white"
      >
        <h1 className="mb-4 text-6xl font-bold">Welcome to the Future</h1>
        <p className="text-xl opacity-80">Explore the possibilities of 3D web experiences</p>
      </motion.div>

      <View orbit className="h-screen w-full">
        <Suspense fallback={null}>
          <CameraAnimation />
          {/* <ambientLight intensity={0.5} /> */}
          {/* <pointLight position={[10, 10, 10]} /> */}
          {/* <Neuroxone route='/blob' scale={4.8} position={[0, -0.6, 0]} rotation={[0, Math.PI/2, 0]} /> */}
          <Neuroxones route='/blob' scale={4.8} position={[0, -0.4, 0]} />
          {/* <Logo route='/blob' scale={0.8} position={[0, -0.4, 0]} /> */}
          <Common />
        </Suspense>
      </View>
    </div>
    <div className="absolute bottom-12 flex w-full justify-center text-center text-white">
        <button 
        className="flex h-12 w-48 items-center justify-center rounded-md bg-gray-800 hover:bg-gray-600"
        onClick={() => {
            router.push('/')
        }}
        >Next</button>
    </div>
    <div className="h-screen w-full bg-black">

      <View orbit className="h-screen w-full">
        <Suspense fallback={null}>
          {/* <ambientLight intensity={0.5} /> */}
          {/* <pointLight position={[10, 10, 10]} /> */}
          <Neuroxone route='/blob' scale={4.8} position={[0, -0.6, 0]} rotation={[0, Math.PI/2, 0]} />
          {/* <NeuroxoneU route='/' scale={0.8} position={[0, -0.4, 0]} /> */}
          <Common />
        </Suspense>
      </View>
    </div>
    <div className="absolute bottom-12 flex w-full justify-center text-center text-white">
        <button 
        className="flex h-12 w-48 items-center justify-center rounded-md bg-gray-800 hover:bg-gray-600"
        onClick={() => {
            router.push('/')
        }}
        >Next</button>
    </div>
    </>
  )
}