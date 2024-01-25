
import { useState } from 'react';
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import { RateConfigPolicy, RateConfigPolicyDetail, WmsRateEditProps } from './interface';
import styles from './style/index.module.less';
import { Button, Divider, Input, Layout, Message, Modal, Select, Space, Tag } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';

const prefixCls = 'wre';
const defaultProps: WmsRateEditProps = {
  stores: [],
  expenseTypes: [],
  calculateRules: [],
  operateTypes: []
};
function WmsRateEdit(baseProps: WmsRateEditProps) {
  const props = useMergeProps<WmsRateEditProps>(baseProps, defaultProps, {});
  const { stores, expenseTypes, calculateRules, operateTypes } = props;

  const [actionKey, setActionKey] = useState<any>();

  const [policy, setPolicy] = useMergeValue<RateConfigPolicy>({}, {
    defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
    value: 'value' in props ? props.value : undefined,
  });
  const onChange = (newData: RateConfigPolicy) => {
    if (!('value' in props)) { setPolicy(newData); }
    if (props.onChange) { props.onChange(newData); }
  };

  function handleNameChange(value: string, e: any): void {
    onChange({ ...policy, name: value });
  }

  function handleStoreChange(value: any, option: any): void {
    onChange({ ...policy, storeId: value });
  }

  function handleAddDetail(): void | Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() >= 0.5) {
          resolve(true);
        } else {
          Message.error('Close failed');
          reject();
        }
      }, 3000);
    });
  }

  function handleEditDetail(detail: RateConfigPolicyDetail, index: number): void | Promise<any> {
    return new Promise((resolve, reject) => {
      setActionKey(index);
      resolve(true);
    });
  }

  function handleDelDetail(detail: RateConfigPolicyDetail, index: number): void | Promise<any> {
    return new Promise((resolve, reject) => {
      const expenseTypeText = expenseTypes.find(f => f.value == detail?.expenseType)?.label;
      const calculateRuleText = calculateRules.find(f => f.value == detail?.calculateRule)?.label;
      Modal.confirm({
        title: '移除配置',
        content: `您即将移除【${expenseTypeText}】${calculateRuleText}配置,确定移除吗？`,
        maskClosable: false,
        onOk: () => {
          let _details = policy?.details || [];
          _details.splice(index, 1);
          onChange({ ...policy, details: _details });
          resolve(true);
        },
        onCancel: () => { reject(); },
      });
    });
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout.Sider>
        <div style={{ padding: '8px' }}>
          <Space direction={'vertical'}>
            <Input placeholder='请输入名称' value={policy.name} onChange={handleNameChange} allowClear />
            <Select placeholder='请选择仓库' value={policy.storeId} onChange={handleStoreChange} options={stores} allowClear />
          </Space>
        </div>
        <Divider style={{ margin: 0 }}>配置明细</Divider>
        <div style={{ padding: '8px' }}>
          {policy?.details?.map((item, index) => {
            const { expenseType, calculateRule, operateType } = item;
            const expenseTypeText = expenseTypes.find(f => f.value == expenseType)?.label;
            const calculateRuleText = calculateRules.find(f => f.value == calculateRule)?.label;
            const operateTypeText = operateTypes.find(f => f.value == operateType)?.label;
            return <div key={index} style={{ marginBottom: '8px', cursor: 'pointer' }}>
              <Tag closable color={actionKey == index ? 'blue' : undefined} style={{ width: '100%' }}
                onClose={() => { return handleDelDetail(item, index); }}>
                <span onClick={() => { return handleEditDetail(item, index); }}>
                  <span style={{ color: 'var(--color-text-1)' }}>{index + 1}.【{expenseTypeText}】{calculateRuleText}</span>
                  {operateTypeText && <span style={{ color: 'var(--color-text-3)' }}>({operateTypeText})</span>}
                </span>
              </Tag>
            </div>
          })}
          <Button icon={<IconPlus />} long size='small'
            onClick={() => { return handleAddDetail(); }}>
            添加
          </Button>
        </div>
      </Layout.Sider>
      <Layout.Content>
        <div style={{ padding: '8px' }}>

        </div>
      </Layout.Content>
    </Layout>
  );
}
export default WmsRateEdit;
