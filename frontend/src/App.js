import React from 'react';
import './App.css';
import Home from './pages/Home.jsx';
import GlobalStyles from './GlobalStyles';

function App() {
  return (
    <>
      <GlobalStyles />
      <div className="App">
        <Home />
      </div>
    </>
  );
}

export default App;
