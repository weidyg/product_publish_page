import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { LeftProdInfoProps, ProdInfo } from "./interface";
import styles from './style/index.module.less';
import { Image, Grid, Table, Space, Typography, Tag } from "@arco-design/web-react";
import { useMemo, useState } from "react";
import { IconDoubleLeft, IconDoubleRight } from "@arco-design/web-react/icon";
import { ColumnProps } from "@arco-design/web-react/es/Table";
import { flat, getSkuGroupObj, getSkuPropObj } from "./until";


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

    const skus = useMemo(() => {
        const rowSpans: any[] = [];
        const salePropNames = saleProp.map(m => m.name);
        let tempSkus = [[...(data?.skus || [])]];
        for (let index = 0; index < salePropNames.length; index++) {
            const salePropName = salePropNames[index];
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
            for (let index = 0; index < sku.props.length; index++) {
                const prop = sku.props[index];
                const rowSpan = rowSpans.find(f => f.name == prop.name && f.value == prop.value);
                const length = rowSpan.length;
                if (length > 1) {
                    prop.rowSpan = length;
                    rowSpan.length = 0;
                }
                if (length === 0) {
                    prop.rowSpan = 0;
                }
            }
        }
        return skus;
    }, [JSON.stringify(data?.skus)]);

    const columns = useMemo(() => {
        const propColumns: ColumnProps[] = saleProp.map(({ name }, i) => {
            return {
                title: name,
                dataIndex: `props${i}`,
                align: 'center',
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
                dataIndex: 'index',
                align: 'center',
                render(value: any, item: any, index: any) {
                    return index + 1;
                },
            },
            ...(propColumns || []),
            {
                title: '价格(元)',
                dataIndex: 'price',
                align: 'right',
                render(value: any, item: any, index: any) {
                    return Number.parseFloat(value).toFixed(2);
                },
            },
            {
                title: '商家编码',
                dataIndex: 'code',
            }
        ];
        return columns;
    }, [JSON.stringify(saleProp)])


    const prefixCls = 'left-prod';
    return (<>
        {data && <div className={styles[prefixCls]}>
            {visible && <div className={styles[`${prefixCls}-info`]}>
                <div>
                    <Space size={0}>
                        <Image alt="" src={data?.image} width={64} height={64}
                            style={{ marginRight: 10 }} />
                        <div>
                            <Typography.Text
                                ellipsis={{ rows: 2 }}
                                style={{ marginBottom: 0 }}>
                                {data?.title || '--'}
                            </Typography.Text>
                            <Space size={0} className={styles.secondary}>
                                <span>货号：</span>
                                <Typography.Paragraph
                                    className={styles.secondary}>
                                    {data?.code || '--'}
                                </Typography.Paragraph>
                            </Space>
                        </div>
                    </Space>
                </div>
                <div className={styles[`${prefixCls}-group-title`]}>基础属性</div>
                <Grid.Row>
                    {data?.cateProp?.map((item, index) => {
                        return <Grid.Col key={index} span={8}>
                            <span className={styles[`${prefixCls}-group-item`]}>
                                {item?.name}：{item?.values?.join('、') || '---'}
                            </span>
                        </Grid.Col>
                    })}
                </Grid.Row>
                <div className={styles[`${prefixCls}-group-title`]}>销售属性</div>
                <Grid.Row>
                    {saleProp?.map((item, index) => {
                        return <Grid.Col key={index}>
                            <span className={styles[`${prefixCls}-group-item`]}
                                style={{ lineHeight: '24px' }}>
                                {`【${item?.name}】`} {item?.values?.map((m, i) => {
                                    return <Tag key={i} bordered size='small'
                                        style={{ marginRight: 5 }}>{m}</Tag>
                                }) || '---'}
                            </span>
                        </Grid.Col>
                    })}
                </Grid.Row>
                <div className={styles[`${prefixCls}-group-title`]}>组合SKU</div>
                <Table
                    rowKey={'id'}
                    size='small'
                    data={skus}
                    columns={columns}
                    borderCell={true}
                    pagination={false}
                    style={{ maxHeight: '360px' }}
                />
            </div>}
            <a className={styles[`${prefixCls}-btn`]}
                onClick={() => { setVisible(!visible); }}>
                <span>原 商 品 信 息</span>
                <span className={styles[`icon`]}>
                    {visible
                        ? <IconDoubleLeft />
                        : <IconDoubleRight />
                    }
                </span>
            </a>
        </div>}
    </>);
}

export default LeftProdInfo;