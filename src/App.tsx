
import { ConfigProvider, Message, Modal } from '@arco-design/web-react';
import { ReactNode } from 'react';
import './styles/index.less'

const prefixCls = 'erp';
Modal.config({ prefixCls: prefixCls, });
Message.config({ prefixCls: prefixCls, });
function App(props: { children?: ReactNode }) {
  const { children } = props;
  return (
    <ConfigProvider
      prefixCls={prefixCls}
      autoInsertSpaceInButton={true}
      componentConfig={{
        Modal: { prefixCls: prefixCls, }
      }}
    >
      {children}
    </ConfigProvider >
  )
}

export default App
