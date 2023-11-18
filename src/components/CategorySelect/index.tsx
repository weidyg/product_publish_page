import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Result, Spin } from "@arco-design/web-react";
import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { debounce } from "lodash";
import styles from './style/index.module.less';
import { CateData, CateSelectData, Category, CategorySelectProps } from "./interface";
import { flattenTree } from "./until";
import CateList from "./list";

const defaultProps: CategorySelectProps = {};
function CategorySelect(baseProps: CategorySelectProps) {
  const props = useMergeProps<CategorySelectProps>(baseProps, defaultProps, {});
  const { title, data, onGetChildrens, onSubmit } = props;
  const [loading, setLoading] = useState(true);
  const [loadingLevel, setLoadingLevel] = useState<number | undefined>(1);
  const [cateSelectData, setCateSelectData] = useState<CateSelectData[]>([{ level: 1 }]);
  const [cateAllData, setCateAllData] = useState<CateData[]>([{ level: 1 }]);
  const [loadErrMsg, setLoadErrMsg] = useState<string>();

  const [cateDatas, cateNamePath, disSubmit] = useMemo(() => {
    const cateDatas: Category[] = cateSelectData?.sort((a, b) => a?.level - b?.level)?.filter(f => !!f.category)?.map(m => m.category!);
    const disSubmit = !cateDatas || cateDatas.length == 0 || cateDatas[cateDatas.length - 1]?.hasChild;
    const cateNamePath = cateDatas?.map(m => m?.name)?.join(" > ");
    return [cateDatas, cateNamePath, disSubmit]
  }, [JSON.stringify(cateSelectData)])

  useEffect(() => {
    setCateAllData([{ level: 1 }]);
    loadCateList(1, 0);
  }, [])

  const flattenData = useMemo(() => {
    return flattenTree(data, 0);
  }, [JSON.stringify(data)])

  const loadCateList = debounce(async function (level: number, parentId?: string | number) {
    setLoading(true);
    setLoadingLevel(level);
    setLoadErrMsg(undefined);
    try {
      // const data: Category[] | undefined = await new Promise((resolve) => {
      //   setTimeout(async () => {
      const data = onGetChildrens
        ? await onGetChildrens(parentId)
        : flattenData.filter(f => f.parentId == parentId);
      //     resolve(data);
      //   }, 2000);
      // })
      if (data && data?.length > 0) {
        setCateAllData(value => {
          value = value.filter(f => f.level < level);
          value.push({ level, data });
          return value;
        });
      }
    } catch (error: any) {
      setLoadErrMsg(error?.message || error + '');
    } finally {
      setLoading(false);
      setLoadingLevel(undefined);
    }
  }, 500);

  async function handleCateClick(level: number, category: Category) {
    const { hasChild, id: parentId } = category;
    if (cateAllData.some(s => s.level > level)) {
      setCateAllData(value => {
        return value.filter(f => f.level <= level);
      });
    }
    if (cateSelectData.some(s => s.level > level)
      || cateSelectData.every(e => e.category?.id !== category.id)
    ) {
      setCateSelectData(values => {
        values = values.filter(f => f.level < level);
        values.push({ level, category });
        return values;
      });
    }
    if (hasChild) {
      await loadCateList(level + 1, parentId);
    }
  }

  function handleOk(e: Event): void {
    onSubmit && onSubmit(cateDatas);
  }

  const prefixCls = 'cate';
  return (<>
    <div>
      <Card title={title !== undefined ? title : '选择商品类目'}>
        {loadErrMsg
          ? <div className={styles[`${prefixCls}-error`]}>
            <Result
              status='500'
              title={'加载错误'}
              subTitle={loadErrMsg}
              extra={
                <Button type='primary'
                  loading={loading}
                  onClick={() => {
                    loadCateList(1, 0);
                  }}>
                  重试
                </Button>
              }
            />
          </div>
          : <div className={styles[`${prefixCls}-boxs`]}>
            {cateAllData?.map((item, index) => {
              const { level, data } = item;
              const currCate = cateSelectData?.find(f => f.level == level)?.category;
              return <Spin
                key={index}
                loading={loading && loadingLevel == level} tip='拼命加载中...'
                className={styles[`${prefixCls}-box`]}
              >
                <CateList
                  level={level}
                  data={data}
                  value={currCate}
                  prefixCls={prefixCls}
                  loading={loading && loadingLevel == level + 1}
                  onItemClick={async (value) => {
                    await handleCateClick(level, value);
                  }}
                />
              </Spin>
            })}
          </div>}
        <div>
          <Alert content={`您当前选择的是：${cateNamePath}`} closable={false} />
        </div>
        <div className={styles[`${prefixCls}-bottom`]}>
          <Button
            type='primary'
            // loading={submiting}
            disabled={disSubmit}
            className={styles[`${prefixCls}-bottom-btn`]}
            onClick={handleOk}
          >
            确认
          </Button>
        </div>
      </Card >
    </div >
  </>
  );
}


export default CategorySelect;
