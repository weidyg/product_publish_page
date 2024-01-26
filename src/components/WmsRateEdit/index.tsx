
import { useRef, useState } from 'react';
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import { RateConfigPolicy, RateConfigPolicyDetail, WmsRateEditProps } from './interface';
import styles from './style/index.module.less';
import { Button, Divider, Form, FormItemProps, Input, InputNumber, Layout, Message, Modal, Select, Space, Tag } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';

const prefixCls = 'wre';
const defaultProps: WmsRateEditProps = {
  convertType: function (calculateRule: number, expenseType: number): { isFixedFee: boolean; isIntervalFee: boolean; isWeight: boolean; isStorageFee: boolean; } {
    const isFixedFee = calculateRule == 10;
    const isIntervalFee = (calculateRule >= 0 && calculateRule != 10);
    const isWeight = calculateRule == 30;
    const isStorageFee = expenseType == 4;
    return { isFixedFee, isIntervalFee, isWeight, isStorageFee }
  }
};
function WmsRateEdit(baseProps: WmsRateEditProps) {
  const props = useMergeProps<WmsRateEditProps>(baseProps, defaultProps, {});
  const { options = {}, onSubmit, convertType } = props;
  const { stores, expenseTypes, calculateRules, operateTypes } = options;

  const formRef = useRef<any>();
  const contentTopRef = useRef<any>();

  const [actionKey, setActionKey] = useState<any>();
  const [editing, setEditing] = useState<boolean>(false);
  const [submiting, setSubmiting] = useState<boolean>(false);

  const [policy, setPolicy] = useMergeValue<RateConfigPolicy>({}, {
    defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
    value: 'value' in props ? props.value : undefined,
  });
  const onChange = (newData: RateConfigPolicy) => {
    if (!('value' in props)) { setPolicy(newData); }
    if (props.onChange) { props.onChange(newData); }
  };


  async function handleSubmit(e: Event): Promise<any> {
    if (!onSubmit) { return; }
    if (editing) {
      Modal.info({
        title: '提示',
        content: `检测到有正在编辑配置，请先保存或取消编辑！`,
        maskClosable: false,
      });
      return;
    }
    setSubmiting(true);
    try {
      await onSubmit(policy);
      Message.success('保存成功！');
    } catch (error: any) {
      Modal.error({
        maskClosable: false,
        title: '错误',
        content: error?.message,
      });
    } finally {
      setSubmiting(false);
    }
  }

  function handleNameChange(value: string, e: any): void {
    onChange({ ...policy, name: value });
  }

  function handleStoreChange(value: any, option: any): void {
    onChange({ ...policy, storeId: value });
  }


  const initForm = () => {
    setEditing(true);
    setActionKey(null);
    formRef?.current?.clearFields();
  }

  function handleAddDetail(): void | Promise<any> {
    return new Promise((resolve, reject) => {
      if (editing) {
        Modal.confirm({
          title: '提示',
          content: `检测到有正在编辑配置，是否继续(将放弃未保存的数据)?`,
          maskClosable: false,
          onOk: () => { initForm(); resolve(true); },
          onCancel: () => { reject(); },
        });
      } else {
        initForm();
        resolve(true);
      }
    });
  }

  function handleSelectDetail(detail: RateConfigPolicyDetail, index: number): void | Promise<any> {
    const change = () => {
      setEditing(false);
      setActionKey(index);
      let detail = (policy?.details || [])[index];
      formRef?.current?.setFieldsValue(detail);
    }
    return new Promise((resolve, reject) => {
      if (actionKey !== index) {
        if (editing) {
          Modal.confirm({
            title: '提示',
            content: `检测到有正在编辑配置，是否继续(将放弃未保存的数据)?`,
            maskClosable: false,
            onOk: () => { change(); resolve(true); },
            onCancel: () => { reject(); },
          });
        } else {
          change();
          resolve(true);
        }
      }
    });
  }

  function handleDelDetail(detail: RateConfigPolicyDetail, index: number): void | Promise<any> {
    return new Promise((resolve, reject) => {
      const expenseTypeText = expenseTypes?.find(f => f.value == detail?.expenseType)?.label;
      const calculateRuleText = calculateRules?.find(f => f.value == detail?.calculateRule)?.label;
      Modal.confirm({
        title: '移除配置',
        content: `您即将移除【${expenseTypeText}】${calculateRuleText}配置,确定移除吗？`,
        maskClosable: false,
        onOk: () => {
          let _details = [...(policy?.details || [])];
          _details.splice(index, 1);
          onChange({ ...policy, details: _details });
          initForm();

          resolve(true);
        },
        onCancel: () => { reject(); },
      });
    });
  }

  async function handleEdit(e: Event): Promise<void> {
    if (!editing) {
      setEditing(true);
    } else {
      try {
        let values = await formRef?.current?.validate();
        const { isIntervalFee, isWeight, isFixedFee } = convertType(values?.calculateRule, values?.expenseType);
        if ((isIntervalFee && isWeight) || isFixedFee) {
          values.quantityRangePrice = [];
        }
        if ((isIntervalFee && !isWeight) || isFixedFee) {
          values.weightRangePrice = [];
        }

        let _details = [...(policy?.details || [])];
        if (actionKey >= 0) {
          _details[actionKey] = values;
        } else {
          _details.push(values);
          setActionKey(_details.length - 1);
        }
        onChange({ ...policy, details: _details });
        setEditing(false);
      } catch (e) {
        Message.error({
          closable: true,
          content: `检测到有必填项未填或格式错误，请补充后重新保存！`,
        });
      }
    }
  }

  function handleCancel(e: Event): void {
    const details = policy?.details || [];
    const detail = actionKey >= 0 && details.length > actionKey ? details[actionKey] : {};
    formRef?.current?.resetFields();
    formRef?.current?.setFieldsValue(detail);
    setEditing(false);
  }

  function QuantityFormItem(props: FormItemProps & { unit: string }) {
    const { label, unit, ...rest } = props;
    const precision = unit == 'kg' ? 3 : 0;
    const step = unit == 'kg' ? 0.001 : 1;
    const prefix = label;
    return <Form.Item {...rest} >
      <InputNumber prefix={prefix} step={step} precision={precision} min={step}
        placeholder='请输入' style={{ width: prefix ? '130px' : '100px' }} />
    </Form.Item>
  }

  function FeeFormItem(props: FormItemProps) {
    const { label, ...rest } = props;
    const step = 0.00;
    const prefix = label;
    return <Form.Item {...rest} >
      <InputNumber prefix={label} step={step} precision={2} min={step}
        placeholder='请输入' style={{ width: prefix ? '130px' : '100px' }} />
    </Form.Item>
  }

  function FormList(props: { listFieldName: string, label: string, unit: string, disabled: boolean }) {
    const { listFieldName, label, unit, disabled } = props;
    return <Form.List field={listFieldName}>
      {(fields, { add, remove, move }) => {
        return (
          <div>
            {fields.map((item, index) => {
              return (
                <div key={item.key}>
                  <Form.Item label={<span style={{ display: 'block', width: '78px', whiteSpace: 'nowrap' }}>{index + 1}、{label}区间</span>}>
                    <Space wrap size={0}>
                      <Space style={{ marginBottom: '8px' }}>
                        <QuantityFormItem disabled={disabled} unit={unit} field={item.field + '.minValue'} rules={[{ required: true }]} noStyle />
                        <span className={styles[`${prefixCls}-label`]} >至</span>
                        <QuantityFormItem disabled={disabled} unit={unit} field={item.field + '.maxValue'}
                          dependencies={[item.field + '.minValue']} rules={[{
                            validator: (v, cb) => {
                              if (!v) {
                                return cb('不能为空')
                              } else {
                                const minValue = formRef?.current?.getFieldValue(item.field + '.minValue') || 0;
                                if (minValue > v) { return cb(`不能小于${minValue}`); }
                              }
                              return cb(null);
                            }
                          }]} noStyle />
                        <span className={styles[`${prefixCls}-label`]} >{unit}</span>
                      </Space>
                      <Space size={0}>
                        <Space wrap size={0}>
                          <Space style={{ marginBottom: '8px' }}>
                            <span className={styles[`${prefixCls}-label`]}>不超</span>
                            <QuantityFormItem disabled={disabled} unit={unit} field={item.field + '.firstValue'}
                              dependencies={[item.field + '.maxValue']} rules={[{
                                validator: (v, cb) => {
                                  if (!v) {
                                    return cb('不能为空')
                                  } else {
                                    const maxValue = formRef?.current?.getFieldValue(item.field + '.maxValue') || 0;
                                    if (v > maxValue) { return cb(`不能大于${maxValue}`); }
                                  }
                                  return cb(null);
                                }
                              }]}
                              noStyle />
                            <span className={styles[`${prefixCls}-label`]}>{unit}</span>
                            <span className={styles[`${prefixCls}-label`]}>费用</span>
                            <FeeFormItem disabled={disabled} field={item.field + '.firstFee'} rules={[{ required: true }]} noStyle />
                            <span className={styles[`${prefixCls}-label`]}>元</span>
                          </Space>
                          <Space style={{ marginBottom: '8px' }}>
                            <span className={styles[`${prefixCls}-label`]} >每超</span>
                            <QuantityFormItem disabled={disabled} unit={unit} field={item.field + '.overValue'} rules={[{ required: true }]} noStyle />
                            <span className={styles[`${prefixCls}-label`]}>{unit}</span>
                            <span className={styles[`${prefixCls}-label`]} >增加</span>
                            <FeeFormItem disabled={disabled} field={item.field + '.overFee'} rules={[{ required: true }]} noStyle />
                            <span className={styles[`${prefixCls}-label`]} >元</span>
                            {fields.length > 1 &&
                              <Button disabled={disabled} icon={<IconDelete />} type='text' status='danger' onClick={() => remove(index)}></Button>
                            }
                          </Space>
                        </Space>
                      </Space>
                    </Space>
                  </Form.Item>
                </div>
              );
            })}
            <Form.Item label={<span style={{ display: 'block', width: '78px', whiteSpace: 'nowrap' }}></span>}>
              <Button disabled={disabled} onClick={() => { add(); }}>添加{label}区间</Button>
            </Form.Item>
          </div>
        );
      }}
    </Form.List>
  }

  return (
    <Layout className={styles[`${prefixCls}-layout`]}>
      <Layout>
        <Layout.Sider width={220}>
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
              const expenseTypeText = expenseTypes?.find(f => f.value == expenseType)?.label;
              const calculateRuleText = calculateRules?.find(f => f.value == calculateRule)?.label;
              const operateTypeText = operateTypes?.find(f => f.value == operateType)?.label;
              return <div key={index} style={{ marginBottom: '8px' }}>
                <Tag size='large' closable color={actionKey == index ? 'blue' : undefined} style={{ width: '100%' }}
                  title={`【${expenseTypeText}】${calculateRuleText}${operateTypeText && `(${operateTypeText})`}`}
                  onClose={() => { return handleDelDetail(item, index); }}>
                  <span onClick={() => { return handleSelectDetail(item, index); }} style={{ cursor: 'pointer' }}>
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
        <Layout.Content className={styles[`${prefixCls}-content`]}>
          <Form
            ref={formRef}
            layout={'inline'}
            autoComplete='off'
            validateMessages={{
              required: (_, { label }) => <>{label || ''}{'不能为空'}</>
            }}
            onValuesChange={(_, v) => {
              const { isIntervalFee, isWeight } = convertType(v.calculateRule, v.expenseType);
              if (isIntervalFee) {
                if (isWeight) {
                  v.weightRangePrice = v.weightRangePrice || [];
                  v.quantityRangePrice = [];
                  if (v.weightRangePrice.length == 0) {
                    v.weightRangePrice.push({});
                    formRef?.current?.setFieldsValue(v);
                  }
                } else {
                  v.quantityRangePrice = v.quantityRangePrice || [];
                  if (v.quantityRangePrice.length == 0) {
                    v.quantityRangePrice.push({});
                    formRef?.current?.setFieldsValue(v);
                  }
                }
              }
              console.log(_, v);
            }}
          >
            <Form.Item noStyle shouldUpdate={(prev, next) => {
              return prev.calculateRule !== next.calculateRule
                || prev.expenseType !== next.expenseType;
            }}>
              {(values) => {
                const { calculateRule, expenseType } = values;
                const { isFixedFee, isIntervalFee, isWeight, isStorageFee } = convertType(calculateRule, expenseType);

                const rangeFieldName = isWeight ? "weightRangePrice" : "quantityRangePrice";
                const label = isWeight ? "重量" : isStorageFee ? "库存" : "数量";
                const unit = isWeight ? "kg" : isStorageFee ? "件/日" : "件";
                const fixedPriceUnit = isStorageFee ? "元/日" : "元/单";

                return <>
                  <div ref={contentTopRef} className={styles[`${prefixCls}-content-top`]}>

                    <Form.Item field={'id'} hidden><Input /></Form.Item>

                    <Form.Item label={'费用类型'} field={'expenseType'} rules={[{ required: true }]}>
                      <Select disabled={!editing} placeholder='请选择' options={expenseTypes} allowClear style={{ width: '120px' }} />
                    </Form.Item>

                    <Form.Item label={'费率规则'} field={'calculateRule'} rules={[{ required: true }]}>
                      <Select disabled={!editing} placeholder='请选择' options={calculateRules} allowClear style={{ width: '120px' }} />
                    </Form.Item>

                    {!isStorageFee &&
                      <Form.Item label={'操作类型'} field={'operateType'} rules={[{ required: true }]}>
                        <Select disabled={!editing} placeholder='请选择' options={operateTypes} allowClear style={{ width: '120px' }} />
                      </Form.Item>
                    }

                    <Form.Item>
                      <Space>
                        <Button type={'primary'} onClick={handleEdit}>
                          {editing ? '保存' : '编辑'}
                        </Button>
                        {editing && <Button onClick={handleCancel}>取消</Button>}
                      </Space>
                    </Form.Item>

                  </div>
                  <Divider style={{ margin: 0 }}></Divider>
                  <div className={styles[`${prefixCls}-content-middle`]}>
                    {isFixedFee
                      ? <Form.Item label={'单价'} field={'unitPrice'} rules={[{ required: true }]}>
                        <InputNumber disabled={!editing} placeholder='请输入单价' suffix={fixedPriceUnit}
                          hideControl step={0.01} min={0.01} precision={2} style={{ width: '160px' }} />
                      </Form.Item>
                      : isIntervalFee
                        ? <FormList disabled={!editing} listFieldName={rangeFieldName} label={label} unit={unit} />
                        : undefined
                    }
                  </div>
                </>
              }}
            </Form.Item>
          </Form>
        </Layout.Content>
      </Layout>
      <Layout.Footer className={styles[`${prefixCls}-footer`]}>
        <Button type='primary' loading={submiting} onClick={handleSubmit}>提交</Button>
      </Layout.Footer>
    </Layout >
  );
}
export default WmsRateEdit;
