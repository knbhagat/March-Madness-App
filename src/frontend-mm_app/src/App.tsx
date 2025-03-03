import { Button } from "@/components/ui/button"
import axios from "axios"
import { useEffect, useState } from 'react'
import MMLogo from "./images/logo.png"
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  // testing api endpoint
  const [res, setRes] = useState(null);

  // for endpoint testing
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('http://localhost:8000/');
      console.log(response)
      setRes(response.data.message)
    }
    fetchData();
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={MMLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>MM App (React Framework + TypeScript Variant)</h1>
      <div className="card">
        <Button onClick={() => setCount((count) => count + 1)}>
          This is the ShadCN Button: {count}
        </Button>
        <div>
          This is the to test that I can access the backend endpoint : {res}
        </div>
      </div>
    </>
  )
}

export default App
