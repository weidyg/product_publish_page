import styles from './style/index.module.less';
import { ProductMateProps, SelectOption, SkuProps, SpuProps } from './interface';
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import React, { useState, useEffect, useContext } from 'react';
import { Table, Grid, Button, Card, Spin, Message, Modal, Space, Skeleton, Result } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import ProdItem from './prod-item';
import { getSysSkus, loadProductInfo, saveSpuInfo, sysSpuSearch } from './api';
import classNames from '@arco-design/web-react/es/_util/classNames';
import { IconFaceFrownFill } from '@arco-design/web-react/icon';

const TableContext = React.createContext<{ options?: any[], loading?: boolean }>({});

function EditableCell(props: any) {
  const { children, className, rowData, column, onHandleSave } = props;

  const { options = [], loading } = useContext(TableContext);
  const cellValueChangeHandler = (value: any) => {
    if (value === rowData[column.dataIndex]) { return; }
    let values: any = { [column.dataIndex]: value, };
    const option = options.find((f: any) => f.value == value);
    if (column.dataIndex == 'sysSkuId') {
      values = {
        ...values,
        sysSkuName: option?.label
      }
    }
    onHandleSave && onHandleSave({ ...rowData, ...values });
  };
  return (
    <div className={column.editable ? `editable-cell ${className}` : className}>
      {column.editable ?
        <ProdItem
          id={rowData[column.dataIndex]}
          title={rowData?.sysSkuName}
          editable={true}
          imageSize={0}
          searching={loading}
          options={options}
          onChange={cellValueChangeHandler}
          placeholder='请选择商品规格'
          idLable='SkuId'
        />
        : children}
    </div>
  );
}

function ProductMate(baseProps: ProductMateProps) {
  const props = useMergeProps<ProductMateProps>(baseProps, {}, {});
  const { ...rest } = props;

  const columns: ColumnProps[] = [
    {
      title: 'No',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (col: any, item: any, index: number) => {
        return index + 1;
      },
    },
    {
      title: '平台商品规格',
      dataIndex: 'skuId',
      render: (text: string, { skuName }: any) => {
        return <ProdItem
          id={text}
          title={skuName}
          imageSize={0}
          copyable={{ id: true }}
          idLable='SkuId'
        />;
      },
    },
    {
      title: '系统商品规格',
      dataIndex: 'sysSkuId',
      editable: true,
    },
  ];

  function onHandleSave(row: any) {
    const newData = [...skus];
    const index = newData.findIndex((item) => row.id === item.id);
    newData.splice(index, 1, { ...newData[index], ...row });
    setSkus(newData);
  }

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [sysSkuLoading, setSysSkuLoading] = useState(false);
  const [sysSpuSearching, setSysSpuSearching] = useState(false);
  const [reload, setReload] = useState(false);
  const [loadErrMsg, setLoadErrMsg] = useState<string>();
  const [sysSpuOptions, setSysSpuOptions] = useState<SelectOption[]>([]);
  const [sysSkuOptions, setSysSkuOptions] = useState<SelectOption[]>([]);
  const [spu, setSpu] = useState<SpuProps>();
  const [skus, setSkus] = useState<SkuProps[]>([]);

  function handleSave() {
    if (!spu?.sysSpuId) {
      Message.error('请设置系统商品');
      return;
    }
    const saveInfo = {
      id: spu?.id,
      spuId: spu?.spuId,
      sysSpuId: spu?.sysSpuId,
      skus: skus.map((f: SkuProps) => {
        return {
          id: f.id,
          skuId: f.skuId,
          sysSkuId: f.sysSkuId,
        }
      })
    }
    if (saveInfo.skus?.some(f => !f.sysSkuId)) {
      Modal.confirm({
        title: '提示',
        content: '检测到有商品规格未设置关联,是否继续提交?',
        onOk: async () => {
          handleSubmit(saveInfo);
        }
      });
    } else {
      handleSubmit(saveInfo);
    }
  }

  async function handleSubmit(saveInfo: any) {
    try {
      setSaveLoading(true);
      await saveSpuInfo(saveInfo);
      Message.success('保存成功！');
    } catch (error: any) {
      Message.error(error?.message);
    } finally {
      setSaveLoading(false);
    }
  }

  const loadSpuInfoFun = async () => {
    try {
      setLoading(true);
      const { skus, ...spu } = await loadProductInfo();
      setSpu(spu);
      setSkus(skus);
    } catch (error: any) {
      setLoadErrMsg(error?.message);
    } finally {
      setLoading(false);
    }
  }

  const loadSysSkus = async (sysSpuId: string | number) => {
    try {
      setSysSkuLoading(true);
      const sysSkus = await getSysSkus(sysSpuId);
      const options = sysSkus?.map(m => ({
        value: m.sysSkuId!,
        label: m.sysSkuName!,
      })) || [];
      setSysSkuOptions(options);
      setSkus((skus: SkuProps[]) => {
        return skus.map((f: SkuProps) => {
          const option = options.find((o: any) => comparison(f.skuName, o.label));
          if (f.sysSpuId != sysSpuId) {
            return {
              ...f,
              sysSpuId: sysSpuId,
              sysSkuId: option?.value,
              sysSkuName: option?.label
            }
          } else {
            if (option) {
              return {
                ...f,
                sysSpuId: sysSpuId,
                sysSkuId: option?.value,
                sysSkuName: option?.label
              }
            }
            return { sysSpuId: sysSpuId, ...f, }
          }
        })
      });
    } catch (error: any) {
      Message.error(error?.message);
    } finally {
      setSysSkuLoading(false);
    }
  }

  useEffect(() => {
    loadSpuInfoFun();
  }, []);

  useEffect(() => {
    if (spu?.sysSpuId) {
      if (!sysSpuOptions || sysSpuOptions.length == 0) {
        setSysSpuOptions([{
          value: spu.sysSpuId!,
          label: spu.sysTitle!,
          extra: spu.sysImage,
        }]);
      }
      loadSysSkus(spu?.sysSpuId);
    } else {
      // setSysSkuOptions([]);
    }
  }, [spu?.sysSpuId]);


  // '尺码:XL;颜色:黑色' 黑色/XL
  function comparison(skuName?: string, sysSkuName?: string): boolean {
    const spec = skuName?.split(';');
    if (spec?.length == 2) {
      const size = spec[0].split(':');
      const color = spec[1].split(':');
      if (size?.length == 2 && color?.length == 2) {
        return `${color[1]}/${size[1]}`?.toUpperCase() == sysSkuName?.toUpperCase();
      }
    }
    return skuName?.toUpperCase() == sysSkuName?.toUpperCase();
  }

  function handleSysSpuChange(_value: any) {
    const { value, label, extra } = sysSpuOptions?.find((f: any) => f.value == _value) as any || {};
    setSpu((p: any) => { return { ...p, sysSpuId: value, sysTitle: label, sysImage: extra } });
  }

  async function handleSysSpuSearch(keyword: any) {
    setSysSpuOptions([]);
    if (!keyword) { return; }
    try {
      setSysSpuSearching(true);
      const sysSpus = await sysSpuSearch(keyword);
      const options = sysSpus?.map(m => ({
        value: m.sysSpuId!,
        label: m.sysTitle!,
        extra: m.sysImage,
      })) || [];
      setSysSpuOptions(options);
    } catch (error: any) {
      Message.error(error?.message);
    } finally {
      setSysSpuSearching(false);
    }
  }

  function handleReset() {
    setSpu((p: any) => {
      return {
        ...p,
        sysSpuId: undefined,
        sysTitle: undefined,
        sysImage: undefined
      }
    });
    setSkus((skus: SkuProps[]) => {
      return skus.map((f: SkuProps) => {
        return { ...f, sysSkuId: undefined, sysSkuName: undefined }
      })
    });
  }
  return (
    <Spin loading={loading} tip='加载中...'>
      <div className={classNames(styles.body, {
        [styles.flex]: loading || loadErrMsg
      })}>
        {loadErrMsg ? (
          <Result
            status={null}
            icon={<IconFaceFrownFill style={{ color: 'rgb(var(--arcoblue-6))' }} />}
            subTitle={loadErrMsg}
            extra={
              <Button type='primary'
                loading={reload}
                onClick={() => {
                  setReload(true)
                  location.reload();
                }}
              >
                刷新
              </Button>
            }
          />
        ) : (!loading && <>
          <div className={styles.container}>
            <div style={{ margin: ' 0 0 0 60px' }}>
              <Grid.Row style={{ margin: '8px auto' }}>
                <Grid.Col span={10}>
                  <Skeleton loading={loading}
                    text={{ rows: 2, width: ['100%'], }}
                    image={{ style: { width: '64px', height: '64px' } }} >
                    <ProdItem
                      id={spu?.spuId}
                      title={spu?.title}
                      image={spu?.image}
                      copyable={true}
                      idLable='SpuId'
                    />
                  </Skeleton>
                </Grid.Col>
                <Grid.Col span={2}>

                </Grid.Col>
                <Grid.Col span={10}>
                  <Skeleton loading={loading}
                    text={{ rows: 2, width: ['100%'], }}
                    image={{ style: { width: '64px', height: '64px' } }} >
                    <ProdItem
                      id={spu?.sysSpuId}
                      title={spu?.sysTitle}
                      image={spu?.sysImage}
                      editable={true}
                      options={sysSpuOptions}
                      searching={sysSpuSearching}
                      remoteSearch={true}
                      onChange={handleSysSpuChange}
                      onSearch={handleSysSpuSearch}
                      placeholder='请输入商品关键词搜索'
                      idLable='SpuId'
                    />
                  </Skeleton>

                </Grid.Col>
              </Grid.Row>
            </div>
            <TableContext.Provider value={{
              loading: sysSkuLoading,
              options: sysSkuOptions,
            }}>
              <Table
                rowKey={'id'}
                size='small'
                data={skus}
                components={{ body: { cell: EditableCell, }, }}
                columns={columns.map((column) =>
                  column.editable
                    ? {
                      ...column,
                      onCell: () => ({
                        onHandleSave,
                      }),
                    }
                    : column
                )}
                border={true}
                borderCell={true}
                pagination={false}
                virtualized={true}
                scroll={{ y: `calc(100vh - 178px)`, x: true }}
              />
            </TableContext.Provider>
            <Card className={styles.floor}>
              <Space>
                <Button
                  type='outline'
                  disabled={saveLoading || loading}
                  onClick={() => { handleReset(); }}>
                  {'重置'}
                </Button>
                <Button
                  type='primary'
                  loading={saveLoading}
                  disabled={saveLoading || loading}
                  onClick={() => { handleSave(); }}>
                  {saveLoading ? '保存中...' : '保 存'}
                </Button>
              </Space>
            </Card>
          </div>
        </>)}
      </div>
    </Spin>
  );
}

export default ProductMate;