
import { Form, Space, Input, Select, InputNumber, Radio, FormItemProps, Grid, Link, Button, Checkbox } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import styles from './index.module.less'
import SkuEditableTable from '../sku-editable-table';
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import ImageUpload from '../ImageUpload';
import { FieldNames, checkDependRules, getTips, getUiTypeOrDefault, getValiRules } from '../until';
import SalePropFormItem from '../sale-prop/SalePropFormItem';
import { Key } from 'react';
import { MyFormItemProps } from '../../pages/product/edit/interface';


function ProFormList(props: MyFormItemProps) {
    const { type, label, name, namePath, value, subItems = [], nestItems = [], ...rest } = props;
    const field = namePath?.join('.') || name;
    let formItems = [...subItems];
    if (nestItems.length > 0) {
        formItems = [...nestItems];
        formItems.unshift({
            ...rest,
            name: 'value',
            type: type == 'multiCheck' ? 'singleCheck' : type,
            namePath: namePath?.concat('value')
        });
    }

    return (
        <Form.List field={field!} noStyle>
            {(fields, { add, remove, move }) => {
                return (
                    <Space wrap size={'mini'}>
                        {fields.map(({ field }, index) => {
                            return (
                                <Space key={index} size={'mini'}>
                                    {
                                        formItems?.map((sm, si) => {
                                            const uiType = sm.type == 'singleCheck' ? 'select' : sm.uiType;
                                            return (
                                                <ProFormItem key={si}
                                                    {...sm} noStyle allowClear={false}
                                                    uiType={uiType} picSize={'mini'}
                                                    fieldName={field + '.' + sm.name}
                                                />
                                            )
                                        })
                                    }
                                    <Form.Item noStyle>
                                        <Link status='error' onClick={() => { remove(index); }}>
                                            <IconDelete />
                                        </Link>
                                    </Form.Item>
                                </Space>
                            );
                        })}
                        <Space key={'add'} size={'mini'}>
                            <Form.Item noStyle>
                                <Button type='text'
                                    icon={<IconPlus />}
                                    onClick={() => { add(); }}>
                                    添加{label}
                                </Button>
                            </Form.Item>
                        </Space>
                    </Space>
                );
            }}
        </Form.List>
    );
}


export function ProFormItem(props: MyFormItemProps & { formSchema?: MyFormItemProps[], picSize?: 'mini' }) {
    const {
        type, label = '', name, namePath, value, options = [], subItems = [], nestItems = [],
        hide, tips, rules, readOnly, allowCustom,
        fieldName, noStyle, picSize, allowClear = true
    } = props || {};

    const _fieldName = fieldName || namePath?.join('.') || name;
    const _uiType = getUiTypeOrDefault(props);
    const _rules = getValiRules(rules);
    const [tipShouldUpdate, getTipValues] = getTips(tips || []);
    const [disShouldUpdate, isHide] = checkDependRules(hide || {});

    const shouldUpdate = (prev: any, next: any, info: any) => {
        let _shouldUpdate = tipShouldUpdate(prev, next, info) || disShouldUpdate(prev, next, info)
            || FieldNames.sku(props);
        return _shouldUpdate!;
    }
    const isPrice = name?.toLocaleLowerCase()?.includes('price');
    const inputNumberProps = {
        precision: isPrice ? 2 : undefined,
        step: isPrice ? 0.01 : undefined
    }
    return (
        <Form.Item noStyle shouldUpdate={shouldUpdate} >
            {(values) => {
                const _hide = isHide(values) === true;
                if (_hide) { return; }
                const tipValues = getTipValues(values) || [];
                const extra = tipValues.map((value: any, index: any) => <div key={index} dangerouslySetInnerHTML={{ __html: value }} />);

                const formItemProps: FormItemProps = {
                    label, extra,
                    rules: _rules,
                    disabled: readOnly,
                    initialValue: value,
                    field: _fieldName,
                    noStyle: noStyle,
                }

                return _uiType == 'input' ? (
                    <Form.Item {...formItemProps} >
                        <Input allowClear={allowClear}
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '734px', minWidth: '220px' }}
                        />
                    </Form.Item>
                ) : _uiType == 'inputNumber' ? (
                    <Form.Item {...formItemProps}>
                        <InputNumber
                            placeholder={`请输入${label}`}
                            style={{ maxWidth: '358px', minWidth: '80px' }}
                            {...inputNumberProps}
                        />
                    </Form.Item>
                ) : _uiType == 'radio' ? (
                    <Form.Item {...formItemProps}>
                        <Radio.Group options={options} />
                    </Form.Item>
                ) : _uiType == 'checkBox' ? (
                    <Form.Item {...formItemProps}>
                        <Checkbox.Group options={options} />
                    </Form.Item>
                ) : _uiType == 'select' || _uiType == 'multiSelect' ? (
                    nestItems.length > 0 ? (
                        <Form.Item {...formItemProps}>
                            <ProFormList {...props} />
                        </Form.Item >
                    ) : (
                        <Form.Item {...formItemProps}>
                            <Select showSearch
                                allowClear={allowClear && _uiType != 'multiSelect'}
                                options={options}
                                allowCreate={allowCustom}
                                mode={_uiType == 'multiSelect' ? 'multiple' : undefined}
                                placeholder={`请选择${_uiType == 'multiSelect' ? '或输入' : ''}${label}`}
                                style={{ maxWidth: '358px', minWidth: '180px' }}
                            />
                        </Form.Item>
                    )
                ) : _uiType == 'imageUpload' ? (
                    <Form.Item {...formItemProps}>
                        <ImageUpload size={picSize} />
                    </Form.Item >
                ) : _uiType == 'richTextEditor' ? (
                    <Form.Item {...formItemProps}>
                        <ReactQuill theme="snow" className={styles['desc']} />
                    </Form.Item>
                ) : type == 'complex' ? (
                    FieldNames.cateProp(props) ? (
                        <Form.Item {...formItemProps}>
                            <Grid cols={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2, xxl: 3, xxxl: 3 }} colGap={12}>
                                {subItems?.map((sm, si) => {
                                    const uiType = sm.type == 'singleCheck' ? 'select' : sm.uiType;
                                    return (
                                        <Grid.GridItem key={'complex' + si} style={{ maxWidth: '358px' }}>
                                            <ProFormItem key={si} {...sm} uiType={uiType} />
                                        </Grid.GridItem>
                                    )
                                })}
                            </Grid>
                        </Form.Item >
                    ) : FieldNames.saleProp(props) ? (
                        <Form.Item {...formItemProps}>
                            {subItems?.map((m, i) => {
                                return (m.type == 'multiCheck' || m.type == 'complex')
                                    ? <SalePropFormItem key={i} {...m} />
                                    : <div key={i}></div>
                            })}
                        </Form.Item >
                    ) : (
                        <Form.Item {...formItemProps}>
                            <Space wrap={true}>
                                {subItems?.map((sm: any, si: any) => {
                                    return (<ProFormItem key={si} {...sm} />)
                                })}
                            </Space>
                        </Form.Item >
                    )
                ) : type == 'multiComplex' ? (
                    FieldNames.sku(props) ? (
                        <Form.Item {...formItemProps}>
                            <SkuEditableTable {...props}
                                allFormItems={props.formSchema || []}
                                values={values} />
                        </Form.Item >
                    ) : (
                        <Form.Item {...formItemProps}>
                            <ProFormList {...props} />
                        </Form.Item >
                    )
                ) : <div>---{label}---</div>;
            }}
        </Form.Item>
    )
}