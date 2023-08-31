
import { ConfigProvider, Modal } from '@arco-design/web-react';
import ProductPublish from './pages/product';

function App() {
  Modal.config({ prefixCls: 'erp', })
  return (
    <ConfigProvider prefixCls='erp'>
      <ProductPublish />
    </ConfigProvider >
  )
}

export default App
