import { useMemo, useState } from "react";
import { Alert, Button, Card, Checkbox, Grid, Menu, Modal, Space } from "@arco-design/web-react";
import { IconCheck } from "@arco-design/web-react/icon";
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import { SalePropCardProps, SalePropGroupOption } from "./interface";
import styles from './style/index.module.less';

const defaultProps: SalePropCardProps = {};
function SalePropCard(baseProps: SalePropCardProps) {
    const props = useMergeProps<SalePropCardProps>(baseProps, defaultProps, {});
    const { isGroup, options, values: propValues, group: propGroup, onOk, onCancel } = props;

    const groupOptions = useMemo(() => {
        if (!isGroup) { return []; }
        let gOpts: SalePropGroupOption[] = [];
        options?.forEach(f => {
            if (f.group) {
                if (gOpts.every(s => s.value != f.group?.value)) {
                    gOpts.push(f.group);
                }
            }
        });
        return gOpts;
    }, [isGroup]);

    const defalutGroup = isGroup ? (propGroup || groupOptions?.find(() => true)?.value) : undefined;

    const [values, setValues] = useState(propValues);
    const [groupValue, setGroupValue] = useState(defalutGroup);
    const checkOptions = useMemo(() => {
        return isGroup
            ? options?.filter(f => f.group?.value == groupValue)?.sort()
            : options?.map(m => m)?.sort();
    }, [isGroup, groupValue]);

    const handleGroupChange = (val: any) => {
        if (val != groupValue) {
            const initValue = (val == propGroup && propValues) ? [...propValues] : [];
            setValues(initValue);
            setGroupValue(val);
        }
    };

    const handleValueChange = (vals: any) => {
        setValues(vals);
    };

    const handleOk = () => {
        if (groupValue != propGroup && propGroup) {
            const oldGroup = groupOptions?.find(f => f.value == propGroup)?.label || propGroup;
            const newGroup = groupOptions?.find(f => f.value == groupValue)?.label || groupValue;
            Modal.confirm({
                title: '操作确认',
                content: `“${oldGroup}”将更换成“${newGroup}”，${oldGroup}及sku数据将被清空，确认更换？`,
                onOk: () => { handleChange(); }
            });
        } else {
            handleChange();
        }
    };

    const handleChange = () => {
        console.log('handleChange',values || [], groupValue);
        onOk && onOk(values || [], groupValue);
    };

    const vaildDisabled = (val: any): boolean => {
        return (groupValue == propGroup && propValues?.includes(val)) || false;
    };

    return (
        <Card className={styles['trigger-popup']}
            title={<Space>
                <>已选 {values?.length || 0} 个</>
                <Button shape='round' type='primary' size='mini'
                    onClick={handleOk}>
                    确 认
                </Button>
                <Button shape='round' size='mini' onClick={onCancel}>
                    取 消
                </Button>
            </Space>}
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
                            <Grid.Row>
                                {checkOptions?.map((item: any, i: any) => {
                                    const { value: val, label: text } = item;
                                    const disabled = vaildDisabled(val);
                                    return (
                                        <Grid.Col key={i} span={6}>
                                            <Checkbox value={val} disabled={disabled}>
                                                {({ checked }) => {
                                                    return (
                                                        <Space align='center'
                                                            className={`${styles['card-checkbox']} ${checked ? styles['card-checkbox-checked'] : ''} ${disabled ? styles['card-checkbox-disabled'] : ''}`}
                                                        >
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
                                        </Grid.Col>
                                    );
                                })}
                            </Grid.Row>
                        </Checkbox.Group>
                    </div>
                </div>
            </Space>
        </Card>
    );
}

export default SalePropCard;