import './App.css'
import MainHeader from "../components/main-header.tsx"
import MainPortfolioCard from "../components/main-portfolio-card.tsx"
import { useAccount } from 'wagmi'

function App() {
  const { isConnected } = useAccount();

  return (
    <div className='min-h-screen w-full bg-black/90'>
      <MainHeader />

      <section className='h-auto flex justify-center items-center py-15'>
        {isConnected ? (
          <>
            <MainPortfolioCard />
          </>
        ) : (
          <section className="flex items-center h-96 text-white text-2xl md:text-3xl">
            Please connect your wallet
          </section>
        )}
      </section>

    </div>
  )
}

export default App
