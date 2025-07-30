import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TopBar from './components/TopNav/TopBar'
import ProductsList from './components/Main Content/ProductsList'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <TopBar></TopBar>
        <ProductsList></ProductsList>
      </div>
     
    </>
  )
}

export default App
