import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../../../App'
import CategorySelectPage from '.'

ReactDOM
  .createRoot(document.getElementById('productcatesel') as HTMLElement)
  .render(<App><CategorySelectPage /></App>)
