
import { ConfigProvider, Modal } from '@arco-design/web-react';
import { ReactNode } from 'react';
import './styles/index.less'

function App(props: { children?: ReactNode }) {
  const { children } = props;
  Modal.config({ prefixCls: 'erp', })
  return (
    <ConfigProvider
      prefixCls='erp'
      autoInsertSpaceInButton={true}
      componentConfig={{

      }}
    >
      {children}
    </ConfigProvider >
  )
}

export default App
