import { useMemo, useState } from "react";
import { Alert, Button, Card, Checkbox, Grid, Input, Menu, Modal, Space, Switch } from "@arco-design/web-react";
import { IconCheck, IconSearch } from "@arco-design/web-react/icon";
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import { SalePropCardProps, SalePropGroupOption } from "./interface";
import styles from './style/index.module.less';
import classNames from "@arco-design/web-react/es/_util/classNames";

const defaultProps: SalePropCardProps = {};
function SalePropCard(baseProps: SalePropCardProps) {
    const props = useMergeProps<SalePropCardProps>(baseProps, defaultProps, {});
    const { isGroup, options: propOptions = [], values: propValues, group: propGroup, onOk, onCancel } = props;
    const groupOptions = useMemo(() => {
        if (!isGroup) { return []; }
        let gOpts: SalePropGroupOption[] = [];
        propOptions?.forEach(f => {
            if (f?.group) {
                if (gOpts?.every(s => s?.value != f?.group?.value)) {
                    gOpts?.push(f?.group);
                }
            }
        });
        return gOpts;
    }, [isGroup]);

    const defalutGroup = isGroup ? (propGroup || groupOptions?.find(() => true)?.value) : undefined;

    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState(propValues);
    const [groupValue, setGroupValue] = useState(defalutGroup);
    const options = useMemo(() => {
        return isGroup
            ? propOptions?.filter(f => f.group?.value == groupValue)?.sort()
            : propOptions?.map(m => m)?.sort();
    }, [isGroup, groupValue]);

    const handleGroupChange = (val: any) => {
        if (val != groupValue) {
            const initValue = (val == propGroup && propValues) ? [...propValues] : [];
            setValues(initValue);
            setGroupValue(val);
        }
    };

    const handleValueChange = (vals: any[]) => {
        setValues(vals);
    };

    const handleOk = () => {
        setLoading(true);
        setTimeout(() => {
            if (groupValue != propGroup && propGroup) {
                const oldGroup = groupOptions?.find(f => f.value == propGroup)?.label || propGroup;
                const newGroup = groupOptions?.find(f => f.value == groupValue)?.label || groupValue;
                Modal.confirm({
                    title: '操作确认',
                    content: `“${oldGroup}”将更换成“${newGroup}”，${oldGroup}及sku数据将被清空，确认更换？`,
                    onOk: () => {
                        handleChange();
                        setLoading(false);
                    }
                });
            } else {
                handleChange();
                setLoading(false);
            }
        }, 10);
    };

    const handleChange = () => {
        onOk && onOk(values || [], groupValue);
    };

    const vaildDisabled = (val: any): boolean => {
        return (groupValue == propGroup && propValues?.includes(val)) || false;
    };

    const vaildChecked = (val: any): boolean => {
        return values?.includes(val) || false;
    };

    const selNum = useMemo(() => {
        return values?.length || 0;
    }, [JSON.stringify(values)]);

    const [showChecked, setShowChecked] = useState(false);
    const [showKeyword, setShowKeyword] = useState<string>();
    return (
        <Card className={styles['trigger-popup']}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space >
                        <>已选 {selNum}个</>
                        <Button loading={loading} shape='round' type='primary' size='mini'
                            onClick={handleOk}>
                            确 认
                        </Button>
                        <Button shape='round' size='mini' onClick={onCancel}>
                            取 消
                        </Button>
                        <Input placeholder='请输入搜索' size='small' style={{ width: '180px' }}
                            allowClear suffix={<IconSearch />} value={showKeyword}
                            onChange={(value) => { setShowKeyword(value); }}
                        />
                    </Space>
                    <Space >
                        <Switch checkedText='已选' uncheckedText='全部'
                            checked={showChecked}
                            onChange={(c) => { setShowChecked(c); }}
                        />
                    </Space>
                </div>
            }
            bodyStyle={{ padding: '0' }}
        >
            <Space size={0}>
                {isGroup && (
                    <div className={styles['card-group-content']}>
                        <Menu inDropdown={true} style={{ width: '100%' }}
                            selectedKeys={[groupValue || '']}
                            onClickMenuItem={handleGroupChange}>
                            {groupOptions?.map((item, _i) => {
                                const { value: val, label: text } = item;
                                return <Menu.Item key={val} title={text}
                                    className={styles['card-group-item']} >
                                    {text}
                                </Menu.Item>
                            })}
                        </Menu>
                    </div>
                )}
                <div>
                    {isGroup && (
                        <Alert banner content='切换分组会清空您已勾选尺码与SKU数据，请谨慎操作' />
                    )}
                    <div className={styles['card-checkbox-content']}>
                        <Checkbox.Group value={values} onChange={handleValueChange}>
                            {options?.map((item: any, i: any) => {
                                const { value: val, label: text } = item;
                                const disabled = vaildDisabled(val);
                                const checked = vaildChecked(val);
                                const sk = !showKeyword || text.indexOf(showKeyword) != -1;
                                const sc = (showChecked && checked) || !showChecked;
                                return (<Checkbox key={i} value={val} disabled={disabled}
                                    className={classNames({
                                        [styles['card-checkbox-hidden']]: !(sk && sc)
                                    })}>
                                    {({ checked: _checked }) => {
                                        return (
                                            <Space align='center'
                                                className={classNames(styles['card-checkbox'], {
                                                    [styles['card-checkbox-checked']]: checked,
                                                    [styles['card-checkbox-disabled']]: disabled
                                                })}>
                                                <div className={styles['card-checkbox-mask']}>
                                                    <IconCheck className={styles['card-checkbox-mask-icon']} />
                                                </div>
                                                <div className={styles['card-checkbox-title']}>
                                                    {text}
                                                </div>
                                            </Space>
                                        );
                                    }}
                                </Checkbox>
                                );
                            })}
                        </Checkbox.Group>
                    </div>
                </div>
            </Space>
        </Card>
    );
}

export default SalePropCard;