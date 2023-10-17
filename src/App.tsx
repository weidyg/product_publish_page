
import { ConfigProvider, Modal } from '@arco-design/web-react';
import ProductEdit from './pages/product/edit';

function App() {
  Modal.config({ prefixCls: 'erp', })
  return (
    <ConfigProvider 
    prefixCls='erp' 
    autoInsertSpaceInButton={true}
    componentConfig={
      {
        
      }
    }
    >
      <ProductEdit />
    </ConfigProvider >
  )
}

export default App
