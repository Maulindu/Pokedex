import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './Fanta.css'
import { Header } from './components/Header'
import { PokeCard } from './components/PokeCard'
import { SideNav } from './components/SideNav'

function App() {

  const [selectedPokemon, setSelectedPokemon] = useState(58)

  return (
    <>
      {/* <Header selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} /> */}
      <SideNav selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} />

      <PokeCard selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} />
      
      
    </>
  )
}

export default App
