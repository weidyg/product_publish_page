
import { ConfigProvider, Modal } from '@arco-design/web-react';
import ProductEditPage from './pages/product/edit';

function App() {
  Modal.config({ prefixCls: 'erp', })
  return (
    <ConfigProvider
      prefixCls='erp'
      autoInsertSpaceInButton={true}
      componentConfig={{}}
    >
      <ProductEditPage />
    </ConfigProvider >
  )
}

export default App
