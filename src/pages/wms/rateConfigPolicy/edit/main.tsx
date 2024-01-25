import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../../../../App'
import WmsRateEditPage from '.'

ReactDOM
  .createRoot(document.getElementById('wmsrateedit') as HTMLElement)
  .render(<App><WmsRateEditPage /></App>)
