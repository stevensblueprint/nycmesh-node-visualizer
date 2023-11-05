"use client";
import dynamic from 'next/dynamic'

// This is requires so that the "no window" error does not occur when loading the map
const DynamicMap = dynamic(() => import("./components/Map"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
})

export default function Home() {
  return (
    <>
      <DynamicMap/>
    </>
  );
}
