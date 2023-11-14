import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../../../App'
import '../../../styles/index.less'
import ProductEditPage from '.'

ReactDOM
  .createRoot(document.getElementById('root') as HTMLElement)
  .render(<App>
    <ProductEditPage />
  </App>)
