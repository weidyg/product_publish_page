import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../../../App'
import ProductEditPage from '.'

ReactDOM
  .createRoot(document.getElementById('productedit') as HTMLElement)
  .render(<App><ProductEditPage /></App>)
