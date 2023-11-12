
import { ConfigProvider, Modal } from '@arco-design/web-react';
import ProductEditPage from './pages/product/edit/index';
import ImageSpace from './components/ImageSpace';
import ProductMate from './components/ProductMate';

function App() {
  Modal.config({ prefixCls: 'erp', })
  return (
    <ConfigProvider
      prefixCls='erp'
      autoInsertSpaceInButton={true}
      componentConfig={{

      }}
    >
      <ProductMate />
      {/* <ImageSpace/> */}
      {/* <ProductEditPage /> */}
    </ConfigProvider >
  )
}

export default App
