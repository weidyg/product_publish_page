import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../../../App'
import ProductMate from '../../../components/ProductMate'

ReactDOM
  .createRoot(document.getElementById('productmate') as HTMLElement)
  .render(<App><ProductMate /></App>)
