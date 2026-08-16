import LogoutButton from './components/LogoutButton'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Coding Assessment Platform
            </h1>

            <p className="mt-2 text-gray-400">
              Welcome to the platform
            </p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

export default App
