import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../../../App'
import '../../../styles/index.less'
import ProductMate from '../../../components/ProductMate'
import CategorySelectPage from '.'

ReactDOM
  .createRoot(document.getElementById('productcategoryselect') as HTMLElement)
  .render(<App><CategorySelectPage /> </App>)
