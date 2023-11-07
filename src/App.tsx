
import { ConfigProvider, Modal } from '@arco-design/web-react';
import ProductEditPage from './pages/product/edit/index';
import ImageSpace from './components/ImageSpace';

function App() {
  Modal.config({ prefixCls: 'erp', })
  return (
    <ConfigProvider
      prefixCls='erp'
      autoInsertSpaceInButton={true}
      componentConfig={{

      }}
    >
      
      {/* <ImageSpace/> */}
      <ProductEditPage />
    </ConfigProvider >
  )
}

export default App
