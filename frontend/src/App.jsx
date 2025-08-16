import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-4 bg-blue-500 text-white">
      Tailwind 적용 테스트
    </div>
  );
}

export default App
