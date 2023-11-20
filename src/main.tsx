import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.less'
import App from './App'
import CategorySelect from './components/CategorySelect'

ReactDOM
  .createRoot(document.getElementById('root') as HTMLElement)
  .render(<App></App>)
