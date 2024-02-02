
import { useMemo, useRef, useState } from 'react';
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import { RateConfigPolicy, RateConfigPolicyDetail, WmsRateEditProps } from './interface';
import styles from './style/index.module.less';
import { Button, Divider, Empty, Form, FormItemProps, Input, InputNumber, Layout, Message, Modal, Select, Space, Tag } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';


const prefixCls = 'wre';
const defaultProps: WmsRateEditProps = {
  convertType: function (calculateRule?: number | undefined, expenseType?: number | undefined): { isFixedFee: boolean; isIntervalFee: boolean; isWeight: boolean; isStorageFee: boolean; } {
    throw new Error('convertType Function not implemented.');
  }
};
function WmsRateEdit(baseProps: WmsRateEditProps) {
  const props = useMergeProps<WmsRateEditProps>(baseProps, defaultProps, {});
  const { options = {}, onSubmit, onCancel, convertType } = props;
  const { stores, expenseTypes, calculateRules } = options;

  const formLeftRef = useRef<any>();
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
    let tempData = { ...newData };
    if (!('value' in props)) { setPolicy(tempData); }
    if (props.onChange) { props.onChange(tempData); }
  };

  function getKey(m: RateConfigPolicyDetail) {
    if (!m) { return ''; }
    return `${m.id || 'i'}_${m.expenseType || 'e'}_${m.calculateRule || 'c'}`;
  }
  function findDuplicates(keys?: string[]) {
    return keys?.filter((key, index, arr) => arr.indexOf(key) !== index && arr.includes(key));
  }

  async function checkError() {
    if (editing) { throw new Error('检测到有正在编辑配置，请先保存或取消编辑！'); }
    try { await formLeftRef?.current?.validate(); }
    catch (error: any) { throw new Error(`检测到有必填项未填或格式错误！`); }
    if ((policy?.details?.length || 0) == 0) { throw new Error('配置明细不能为空，请添加配置！'); }
    const keys = policy?.details?.map(f => {
      const expenseTypeText = expenseTypes?.find(fi => fi.value == f.expenseType)?.label;
      return `${expenseTypeText || ''}`;
    });
    const hasKeys = findDuplicates(keys);
    if ((hasKeys?.length || 0) > 0) {
      throw new Error(`配置明细(${hasKeys?.join(',')})类型重复，请修改后再重新提交！`);
    }
  }

  async function handleCancel(e: Event): Promise<any> {
    if (!onCancel) { return; }
    await onCancel();
  }

  async function handleSubmit(e: Event): Promise<any> {
    if (!onSubmit) { return; }
    setSubmiting(true);
    try {
      await checkError();
      await onSubmit(policy);
      Message.success('提交成功！');
    } catch (error: any) {
      Modal.error({
        title: '提示',
        content: error?.message,
        maskClosable: false,
        style: { textAlign: 'center' }
      });
    } finally {
      setSubmiting(false);
    }
  }

  function handleNameOrStoreChange(value: any, values: any): void {
    onChange({ ...policy, ...values });
  }

  const initForm = (initdata?: RateConfigPolicyDetail) => {
    setEditing(true);
    setActionKey(null);
    setFormFieldsValue(initdata, true);
  }

  function handleAddDetail(): void | Promise<any> {
    const key = uuid(8);
    return new Promise((resolve, reject) => {
      if (editing) {
        Modal.confirm({
          title: '提示',
          content: `检测到有正在编辑配置，是否继续(将放弃未保存的数据)?`,
          maskClosable: false,
          onOk: () => { initForm({ key: key }); resolve(true); },
          onCancel: () => { reject(); },
        });
      } else {
        initForm({ key: key });
        resolve(true);
      }
    });
  }

  function handleSelectDetail(detail: RateConfigPolicyDetail, index: number): void | Promise<any> {
    const change = () => {
      setActionKey(index);
      setTimeout(() => {
        detail.key = detail.key || getKey(detail);
        setFormFieldsValue(detail);
        setEditing(false);
      }, 10);
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
          if (actionKey == index) {
            setActionKey(undefined);
            setFormFieldsValue(undefined);
          }
          resolve(true);
        },
        onCancel: () => { reject(); },
      });
    });
  }

  async function handleDetailEdit(e: Event): Promise<void> {
    if (!editing) {
      setEditing(true);
    } else {
      try {
        let values = await formRef?.current?.validate();
        const { isIntervalFee, isWeight, isFixedFee } = convertType(values?.calculateRule, values?.expenseType);
        if ((isIntervalFee && isWeight) || isFixedFee) { values.quantityRangePrice = []; }
        if ((isIntervalFee && !isWeight) || isFixedFee) { values.weightRangePrice = []; }
        let _details = [...policy.details || []];
        if (actionKey === 0 || actionKey > 0) {
          _details[actionKey] = values;
        } else {
          values.key = values.key || getKey(values);
          _details.push(values);

          const _actionKey = _details.length - 1;
          setActionKey(_actionKey);
          setFormCurrentDetail(_actionKey, _details);
        }
        onChange({ ...policy, details: _details });
        setEditing(false);
      } catch (e) {
        // Message.error({
        //   closable: true,
        //   content: `检测到有必填项未填或格式错误，请补充后重新保存！`,
        // });
      }
    }
  }

  function handleDetailCancel(e: Event): void {
    setFormCurrentDetail(actionKey, policy?.details);
    if (actionKey == null) { setActionKey(undefined); }
    setEditing(false);
  }


  function setFormCurrentDetail(index?: number, details?: RateConfigPolicyDetail[]): void {
    const _detail = index === 0 || index && (index > 0)
      ? details && details[index] : undefined;
    setFormFieldsValue(_detail);
  }
  function setFormFieldsValue(detail?: RateConfigPolicyDetail, clear?: boolean): void {
    if (detail) {
      if (clear) { formRef?.current?.clearFields(); }
      formRef?.current?.setFieldsValue(detail);
    } else {
      formRef?.current?.clearFields();
    }
  }

  function NumFormItem(props: FormItemProps & { step?: number, precision?: number, includes?: boolean }) {
    const { label, precision, step, includes, ...rest } = props;
    const prefix = label;
    const suffix = includes === true ? '含' : includes === false ? '不含' : '';
    return <Form.Item {...rest} >
      <InputNumber prefix={prefix} suffix={suffix} step={step} precision={precision} min={step}
        placeholder='请输入' style={{ width: prefix ? '130px' : '100px' }} />
    </Form.Item>
  }

  function FeeFormItem(props: FormItemProps) {
    const { label, ...rest } = props;
    return <Form.Item {...rest} >
      <InputNumber prefix={label} step={0.01} precision={2} min={0.00}
        placeholder='请输入' style={{ width: label ? '130px' : '100px' }} />
    </Form.Item>
  }

  function FormList(props: { listFieldName: string, label?: string, unit: string, disabled: boolean }) {
    const { listFieldName, label, unit, disabled } = props;
    const precision = unit == 'kg' ? 3 : 0;
    const step = unit == 'kg' ? 0.001 : 1;

    return <Form.List field={listFieldName}>
      {(fields, { add, remove, move }) => {
        return (
          <div>
            {fields.map(({ key, field }, index) => {
              return (
                <div key={key}>
                  {/* {item.key}_{item.field}_{index} */}
                  <Form.Item label={<span style={{ display: 'block', width: '78px', whiteSpace: 'nowrap' }}>{index + 1}、{label}区间</span>}>
                    <Space wrap size={[8, 0]}>
                      <Space style={{ marginBottom: '8px' }}>
                        <NumFormItem disabled={disabled}
                          step={step} precision={precision} includes={true}
                          field={field + '.minValue'} noStyle
                          rules={[{
                            validator: (v, cb) => {
                              if (!v) { return cb('不能为空') } else {
                                const values = formRef?.current?.getFieldValue(listFieldName) || [];
                                for (let i = 0; i < values.length; i++) {
                                  if (i != index) {
                                    const _v = values[i];
                                    if (v >= _v?.minValue && v < _v?.maxValue) {
                                      return cb('区间值重复');
                                    }
                                  }
                                }
                              }
                              return cb(null);
                            }
                          }]} />
                        <span className={styles[`${prefixCls}-label`]} >至</span>
                        <NumFormItem disabled={disabled} step={step} precision={precision}
                          field={field + '.maxValue'} noStyle
                          dependencies={[field + '.minValue']}
                          rules={[{
                            validator: (v, cb) => {
                              if (!v) { return cb('不能为空') } else {
                                const minValue = formRef?.current?.getFieldValue(field + '.minValue') || 0;
                                if (minValue > v) { return cb(`不能小于${minValue}`); }
                              }
                              return cb(null);
                            }
                          }]} />
                        <span className={styles[`${prefixCls}-label`]} >{unit}</span>
                      </Space>
                      <Space size={0}>
                        <Space wrap size={[8, 0]}>
                          <Space style={{ marginBottom: '8px' }}>
                            <span className={styles[`${prefixCls}-label`]}>前</span>
                            <NumFormItem disabled={disabled}
                              step={step} precision={precision}
                              field={field + '.firstValue'} noStyle
                              dependencies={[field + '.maxValue']} rules={[{
                                validator: (v, cb) => {
                                  if (!v) { return cb('不能为空') } else {
                                    const maxValue = formRef?.current?.getFieldValue(field + '.maxValue') || 0;
                                    if (v > maxValue) { return cb(`不能大于${maxValue}`); }
                                  }
                                  return cb(null);
                                }
                              }]} />
                            <span className={styles[`${prefixCls}-label`]}>{unit}</span>
                            <span className={styles[`${prefixCls}-label`]}>费用</span>
                            <FeeFormItem disabled={disabled} field={field + '.firstFee'} rules={[{ required: true }]} noStyle />
                            <span className={styles[`${prefixCls}-label`]}>元</span>
                          </Space>
                          <Space style={{ marginBottom: '8px' }}>
                            <span className={styles[`${prefixCls}-label`]} >每超</span>
                            <NumFormItem disabled={disabled}
                              step={step} precision={precision}
                              field={field + '.overValue'} noStyle
                              rules={[{ required: true }]} />
                            <span className={styles[`${prefixCls}-label`]}>{unit}</span>
                            <span className={styles[`${prefixCls}-label`]} >增加</span>
                            <FeeFormItem disabled={disabled} field={field + '.overFee'} rules={[{ required: true }]} noStyle />
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
              <Button disabled={disabled} onClick={async () => {
                try {
                  const values = await formRef?.current?.validate();
                  const { minValue, maxValue } = values[listFieldName][fields.length - 1] || {};
                  const _minValue = maxValue == minValue ? maxValue + step : maxValue;
                  add({ minValue: _minValue });
                } catch (error) {

                }
              }}>添加{label}区间</Button>
            </Form.Item>
          </div>
        );
      }}
    </Form.List>
  }

  return (
    <Layout className={styles[`${prefixCls}-layout`]}>
      <Layout>
        <Layout.Sider className={styles[`${prefixCls}-sider`]} width={260}>
          <div style={{ padding: '12px 8px 0' }}>
            <Form ref={formLeftRef}
              layout='vertical'
              initialValues={{ name: policy?.name, storeId: policy?.storeId }}
              onValuesChange={handleNameOrStoreChange}
              validateMessages={{
                required: (_, { label }) => <>{label || ''}{'不能为空'}</>
              }}>
              <Form.Item field={'name'} rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder='请输入名称' allowClear />
              </Form.Item>
              <Form.Item field={'storeId'} rules={[{ required: true, message: '请选择仓库' }]}>
                <Select placeholder='请选择仓库' options={stores} allowClear />
              </Form.Item>
            </Form>
          </div>
          <Divider style={{ margin: 0 }}>配置明细</Divider>
          <div style={{ padding: '8px' }}>
            {policy?.details?.map((item, index) => {
              const { expenseType, calculateRule } = item;
              const expenseTypeText = expenseTypes?.find(f => f.value == expenseType)?.label;
              const calculateRuleText = calculateRules?.find(f => f.value == calculateRule)?.label;
              return <div key={getKey(item)} style={{ marginBottom: '8px' }}>
                <Tag size='medium' closable color={actionKey == index ? 'blue' : undefined} style={{ width: '100%' }}
                  title={`【${expenseTypeText}】${'- '}${calculateRuleText}`}
                  onClose={() => { return handleDelDetail(item, index); }}>
                  <span onClick={() => { return handleSelectDetail(item, index); }} style={{ cursor: 'pointer' }}>
                    <span className={styles[`${prefixCls}-tag`]}>
                      {index + 1}.【{expenseTypeText}】{'- '}{calculateRuleText}
                    </span>
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
          {actionKey === undefined
            ? <div className={styles[`${prefixCls}-content-empty`]}>
              <Empty description='选择左侧配置明细编辑项或点击添加按钮新增项' />
            </div>
            : <Form
              ref={formRef}
              layout={'inline'}
              autoComplete='off'
              validateMessages={{
                required: (_, { label }) => <>{label || ''}{'不能为空'}</>
              }}
              onValuesChange={(v, vs) => {
                // console.log('onValuesChange value', v);
                // console.log('onValuesChange values', vs);
                const { isIntervalFee, isWeight } = convertType(v.calculateRule, v.expenseType);
                if (isIntervalFee) {
                  if (isWeight) {
                    v.weightRangePrice = v.weightRangePrice || [];
                    v.quantityRangePrice = [];
                    if (v.weightRangePrice.length == 0) {
                      v.weightRangePrice.push({ minValue: 0.001, });
                      formRef?.current?.setFieldsValue(v);
                    }
                  } else {
                    v.quantityRangePrice = v.quantityRangePrice || [];
                    if (v.quantityRangePrice.length == 0) {
                      v.quantityRangePrice.push({ minValue: 1, });
                      formRef?.current?.setFieldsValue(v);
                    }
                  }
                }
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
                  const fixedPriceUnit = isStorageFee ? "元/日" : "元/件";
                  // console.log('11', calculateRule, expenseType);
                  // console.log('22', isFixedFee, isIntervalFee, isWeight, isStorageFee);
                  // if (isStorageFee) {
                  //   setTimeout(() => {
                  //     formRef?.current?.setFieldValue('operateType', undefined);
                  //   }, 10);
                  // }
                  return <>
                    <div ref={contentTopRef} className={styles[`${prefixCls}-content-top`]}>
                      <Form.Item field={'key'} hidden><Input /></Form.Item>
                      <Form.Item field={'id'} hidden><Input /></Form.Item>
                      <Form.Item label={'费用类型'} field={'expenseType'} rules={[{ required: true }, {
                        validator: (v, cb) => {
                          if (!v) { return cb('费用类型不能为空') }
                          else {
                            const key = formRef?.current?.getFieldValue('key');
                            const has = policy?.details?.some(f => f.key !== key && f.expenseType == v);
                            console.log('validator 费用类型', has, `f.key !== ${key} && f.expenseType == ${v}`, policy?.details);
                            if (has) { return cb('该费用类型已经存在') }
                          }
                          return cb(null);
                        }
                      }]}>
                        <Select disabled={!editing} placeholder='请选择' options={expenseTypes} allowClear style={{ width: '180px' }} />
                      </Form.Item>

                      <Form.Item label={'费率规则'} field={'calculateRule'} rules={[{ required: true }]}>
                        <Select disabled={!editing} placeholder='请选择' options={calculateRules} allowClear style={{ width: '180px' }} />
                      </Form.Item>

                      <Form.Item>
                        <Space>
                          <Button type={'primary'} onClick={handleDetailEdit}>
                            {editing ? '保存' : '编辑'}
                          </Button>
                          {editing && <Button onClick={handleDetailCancel}>取消</Button>}
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
                          ? <FormList disabled={!editing} listFieldName={rangeFieldName} unit={unit} />
                          : undefined
                      }
                    </div>
                  </>
                }}
              </Form.Item>
            </Form>
          }
        </Layout.Content>
      </Layout>
      <Layout.Footer className={styles[`${prefixCls}-footer`]}>
        <Space size={'large'}>
          <Button onClick={handleCancel}>取消</Button>
          <Button type='primary' loading={submiting} onClick={handleSubmit}>提交</Button>
        </Space>
      </Layout.Footer>
    </Layout >
  );
}

function uuid(len: number, radix?: number) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  radix = radix || chars.length;
  if (len) {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix];
    }
  } else {
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}
export default WmsRateEdit;
