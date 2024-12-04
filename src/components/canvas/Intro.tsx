'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useState } from 'react'
import { Line, useCursor, MeshDistortMaterial } from '@react-three/drei'
import { useRouter } from 'next/navigation'
import { useLayoutEffect } from 'react'

export const Blob = ({ route = '/', ...props }) => {
  const router = useRouter()
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      onClick={() => router.push(route)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
    </mesh>
  )
}

export const Logo = ({ route = '/blob', ...props }) => {
  const mesh = useRef(null)
  const router = useRouter()

  const [hovered, hover] = useState(false)
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), [])

  useCursor(hovered)
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.y = Math.sin(t) * (Math.PI / 8)
    mesh.current.rotation.x = Math.cos(t) * (Math.PI / 8)
    mesh.current.rotation.z -= delta / 4
  })

  return (
    <group ref={mesh} {...props}>
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.005} />
      {/* @ts-ignore */}
      {/* <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.15} rotation={[0, 0, 1]} /> */}
      {/* @ts-ignore */}
      <Line worldUnits points={points} color='#1fb2f5' lineWidth={0.005} rotation={[0, 0, -1]} />
      <mesh onClick={() => router.push(route)} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial roughness={0.5} color={hovered ? 'hotpink' : '#1fb2f5'} />
      </mesh>
    </group>
  )
}

export function Neuroxones(props) {
  const { scene } = useGLTF('/models/neuroxones.glb')

  useFrame((state, delta) => (scene.rotation.y += delta*0.1))

  return <primitive object={scene} {...props} />
}
export function Neuroxone(props) {
  const { scene, materials} = useGLTF('/models/neuroxones_mod.glb')
  console.log(scene)
  return <primitive object={scene} {...props} />
}





export function NeuroxoneU({ ...props }) {
  const { scene, materials } = useGLTF('/models/neuroxones_mod.glb')
  useLayoutEffect(() => {
    Object.values(materials).forEach((material) => (material.roughness = 0))
    Object.assign(materials.light, {
      color: new THREE.Color('#ff2060'),
      emissive: new THREE.Color(1, 0, 0),
      emissiveIntensity: 2,
      toneMapped: false
    })
    if (scene.children.length > 4) {
      scene.children[1].material.emissive = new THREE.Color(1, 0, 0)
      scene.children[2].material.emissive = new THREE.Color(1, 0, 0)
      scene.children[3].material.emissive = new THREE.Color(1, 0, 0)
      scene.children[4].material.emissive = new THREE.Color(1, 0, 0)
    }
  }, [scene, materials])
  return <primitive object={scene} {...props} />
}