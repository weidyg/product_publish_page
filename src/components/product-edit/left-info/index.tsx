import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { LeftProdInfoProps } from "./interface";
import styles from './style/index.module.less';
import { Image, Grid, Table, Space, Typography, Tag, Empty, Skeleton } from "@arco-design/web-react";
import { useMemo, useState } from "react";
import { IconDoubleLeft, IconDoubleRight } from "@arco-design/web-react/icon";
import { ColumnProps } from "@arco-design/web-react/es/Table";
import { flat, getSkuGroupObj, getSkuPropObj } from "./until";
import { thumbnail } from "../until";


const defaultProps: LeftProdInfoProps = {
    data: undefined
};
function LeftProdInfo(baseProps: LeftProdInfoProps) {
    const props = useMergeProps<LeftProdInfoProps>(baseProps, defaultProps, {});
    const { data } = props;
    const [visible, setVisible] = useState(false);
    const saleProp = useMemo(() => {
        return data?.saleProp?.sort((a: any, b: any) => {
            return b.name.localeCompare(a.name);
        }) || [];
    }, [JSON.stringify(data?.saleProp)]);

    const [skus, skuPropNames] = useMemo(() => {
        const rowSpans: any[] = [];
        const _skus = data?.skus || [];
        if (_skus.length == 0) { return [[], []]; }
        const skuSalePropNames = _skus.map(m => m.props.map(m => m.name));
        const skuPropNames = Array.from(new Set(flat(skuSalePropNames)));
        let tempSkus = [[..._skus]];
        for (let index = 0; index < skuPropNames.length; index++) {
            const salePropName = skuPropNames[index];
            let nextTempSkus: any[] = [];
            for (let index = 0; index < tempSkus.length; index++) {
                const _tempSkus = tempSkus[index];
                const subSkusGroupObj = getSkuGroupObj(_tempSkus, salePropName);
                const subObjValues: any[] = [];
                Object.keys(subSkusGroupObj).forEach(key => {
                    const values = subSkusGroupObj[key] || [];
                    subObjValues.push(values);
                    rowSpans.push({ name: salePropName, value: key, length: values.length });
                });
                nextTempSkus = nextTempSkus.concat(subObjValues);
            }
            tempSkus = [...nextTempSkus];
        }
        const skus = flat(tempSkus);
        for (let index = 0; index < skus.length; index++) {
            const sku = skus[index];
            sku.key = index + 1;
            for (let index = 0; index < sku.props.length; index++) {
                const prop = sku.props[index];
                const rowSpan = rowSpans.find(f => f.name == prop.name && f.value == prop.value);
                const length = rowSpan?.length;
                if (length > 1) {
                    prop.rowSpan = length;
                    rowSpan.length = 0;
                }
                if (length === 0) {
                    prop.rowSpan = 0;
                }
            }
        }
        return [skus, skuPropNames];
    }, [JSON.stringify(data?.skus)]);

    const columns = useMemo(() => {
        const propColumns: ColumnProps[] = skuPropNames.map((name, i) => {
            return {
                title: name,
                dataIndex: `props${i}`,
                align: 'center',
                width: 120,
                render(col: any, item: any, index: any) {
                    const prop = getSkuPropObj(item, name);
                    const value = prop?.value;
                    const rowSpan = prop?.rowSpan === 0 ? 0 : prop?.rowSpan || 1;
                    return { children: value, props: { rowSpan }, };
                },
            };
        });
        const columns: ColumnProps[] = [
            {
                title: 'No',
                dataIndex: 'key',
                align: 'center',
                width: 60,
            },
            ...(propColumns || []),
            {
                title: '价格(元)',
                dataIndex: 'price',
                align: 'right',
                width: 92,
                render(value: any, item: any, index: any) {
                    if (!value && value !== 0) { return ''; }
                    return Number.parseFloat(value).toFixed(2);
                },
            },
            {
                title: '商家编码',
                width: 220,
                dataIndex: 'code',
            }
        ];
        return columns;
    }, [JSON.stringify(skuPropNames)])

    const prefixCls = 'left-prod';
    return (<div className={styles[prefixCls]}>
        {visible && <div className={styles[`${prefixCls}-info`]}>
            <div>
                <Space size={0}>
                    <div className={styles['prod-img']} >
                        <img alt="" src={thumbnail(data?.image || '', 80, 80)} />
                    </div>
                    <div>
                        <div className={styles['prod-title']}>
                            <Typography.Text
                                ellipsis={{ rows: 2 }}
                                style={{ marginBottom: 0 }}>
                                {data?.title || '- -'}
                            </Typography.Text>
                        </div>
                        <div>
                            <span className={styles.secondary}>货号：</span>
                            <span>{data?.code || '- -'}</span>
                        </div>
                        <div>
                            {data?.marketPrice && <del className={styles.secondary}
                                style={{ marginRight: '8px' }}>
                                <span>￥</span>
                                {Number.parseFloat(data?.marketPrice + '').toFixed(2)}
                            </del>}
                            <span className={styles.secondary}>￥</span>
                            {data?.price ? Number.parseFloat(data?.price + '').toFixed(2) : '-.--'}
                        </div>
                    </div>
                </Space>
            </div>
            <div className={styles[`${prefixCls}-group-title`]}>基础属性</div>
            {(data?.cateProp?.length || 0) > 0
                ? <Grid.Row>
                    {data?.cateProp?.map((item, index) => {
                        return <Grid.Col key={index} span={8}>
                            <span className={styles[`${prefixCls}-group-item`]}>
                                <span className={styles.secondary}
                                    style={{ fontSize: '14px' }}>
                                    {item?.name}：
                                </span>
                                <span> {item?.values?.join('、') || '---'}</span>
                            </span>
                        </Grid.Col>
                    })}
                </Grid.Row>
                : <Empty />
            }
            <div className={styles[`${prefixCls}-group-title`]}>销售属性</div>
            {(saleProp?.length || 0) > 0
                ? <Grid.Row>
                    {saleProp?.map((item, index) => {
                        return <Grid.Col key={index}>
                            <span className={styles[`${prefixCls}-group-item`]}
                                style={{ lineHeight: '24px' }}>
                                <span className={styles.secondary}
                                    style={{ fontSize: '14px' }}>
                                    {`【${item?.name}】`}
                                </span>
                                <span>{item?.values?.map((m, i) => {
                                    return <Tag key={i} bordered size='small'
                                        style={{ marginRight: 5 }}>{m}</Tag>
                                }) || '---'}</span>
                            </span>
                        </Grid.Col>
                    })}
                </Grid.Row>
                : <Empty />
            }
            <div className={styles[`${prefixCls}-group-title`]}>组合SKU</div>
            {(saleProp?.length || 0) > 0 || skus.length > 0
                ? <Table
                    size='small'
                    data={skus}
                    columns={columns}
                    borderCell={true}
                    pagination={false}
                    scroll={{ y: 320, x: true }}
                />
                : <Empty />
            }


        </div>}
        <a className={styles[`${prefixCls}-btn`]}
            onClick={() => { setVisible(!visible); }}>
            <span>关联商品信息</span>
            <span className={styles[`icon`]}>
                {visible
                    ? <IconDoubleLeft />
                    : <IconDoubleRight />
                }
            </span>
        </a>
    </div >);
}

export default LeftProdInfo;