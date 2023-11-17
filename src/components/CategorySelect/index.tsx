import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Input, Space, Spin, Typography } from "@arco-design/web-react";
import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { IconLoading, IconRight, IconSearch } from "@arco-design/web-react/icon";
import classNames from "@arco-design/web-react/es/_util/classNames";
import { debounce } from "lodash";
import styles from './style/index.module.less';
import { CateShowData, Category, CategoryItemProps, CategoryListProps, CategorySelectProps } from "./interface";
import { flattenTree, groupShowData } from "./until";

const defaultProps: CategorySelectProps = {};
function CategorySelect(baseProps: CategorySelectProps) {
  const props = useMergeProps<CategorySelectProps>(baseProps, defaultProps, {});
  const { title, data, onGetChildrens, submiting, onSubmit } = props;
  const [loading, setLoading] = useState(true);
  const [loadingLevel, setLoadingLevel] = useState<number | undefined>(1);
  const [cateShowData, setCateShowData] = useState<CateShowData[]>([{ level: 1 }]);

  const [cateDatas, cateNamePath, disSubmit] = useMemo(() => {
    const cateDatas: Category[] = cateShowData?.sort((a, b) => a?.level - b?.level)?.filter(f => !!f.currCate)?.map(m => m.currCate!);
    const disSubmit = !cateDatas || cateDatas.length == 0 || cateDatas[cateDatas.length - 1]?.hasChild;
    const cateNamePath = cateDatas?.map(m => m?.name)?.join(" > ");
    return [cateDatas, cateNamePath, disSubmit]
  }, [JSON.stringify(cateShowData)])

  useEffect(() => {
    setCateShowData([{ level: 1 }]);
    loadCateList(1, 0);
  }, [])

  const flattenData = useMemo(() => {
    return flattenTree(data, 0);
  }, [JSON.stringify(data)])

  const loadCateList = debounce(async function (level: number, parentId?: string | number) {
    setLoading(true);
    setLoadingLevel(level);
    try {
      const data = onGetChildrens
        ? await onGetChildrens(parentId)
        : flattenData.filter(f => f.parentId == parentId);

      setCateShowData(value => {
        const newData = value.filter(f => f.level !== level);
        const showData = groupShowData(data);
        newData.push({ level: level, showData, data });
        return newData;
      });
    } catch (error) {

    } finally {
      setLoading(false);
      setLoadingLevel(undefined);
    }
  }, 500);

  function handleSeach(seachValue: string, cate: CateShowData): void {
    if (!cate?.data) { return; }
    setCateShowData(value => {
      return value.map(m => {
        if (m.level == cate.level) {
          let tempData = m.data || [];
          if (seachValue) {
            tempData = tempData.filter(f => f.name?.indexOf(seachValue) > -1);
          }
          m.showData = groupShowData(tempData);
        }
        return m;
      });
    });
  }

  async function handleCateClick(showData: CateShowData, currCate: Category) {
    const { level } = showData;
    const { hasChild, id: parentId } = currCate;
    setCateShowData(values => {
      const newValues = [];
      for (let index = 0; index < values?.length; index++) {
        const value = values[index];
        if (value.level < level) {
          newValues.push({ ...value });
        }
        if (value.level == level) {
          newValues.push({ ...value, currCate });
        }
      }
      return newValues;
    });
    if (hasChild) {
      await loadCateList(level + 1, parentId);
    }
  }

  function handleOk(e: Event): void {
    onSubmit && onSubmit(cateDatas);
  }

  function CateItem(props: CategoryItemProps) {
    const { id, name, hasChild, loading, active, onClick } = props;
    function handleClick() {
      onClick && onClick(id);
    }
    return <li onClick={handleClick}
      className={classNames({ [styles['active']]: active })}>
      <Space size={0} align={'center'} className={styles['item']}>
        <span className={classNames(styles['label'], { [styles['hasChild']]: hasChild })}>{name}</span>
        <span>{hasChild && (loading ? <IconLoading /> : <IconRight />)}</span>
      </Space>
    </li>
  }

  function CateList(props: CategoryListProps) {
    const { level = -1, data = [], value, onItemClick } = props;

    async function handleItemClick(cate: Category): Promise<void> {
      onItemClick && await onItemClick(cate);
    }
    return <div className={styles[`${prefixCls}-list`]}>
      <ul>
        {data?.map((item, index) => {
          const { groupName, cates } = item;
          return <span key={index}>
            {groupName && <div className={styles['gname']}>{groupName}</div >}
            {cates?.map((cate, i) => {
              const _active = cate.id == value?.id;
              const _loading = _active && loading && loadingLevel == level + 1;
              return <CateItem key={i} {...cate}
                loading={_loading}
                active={_active}
                onClick={(id) => {
                  handleItemClick(cate);
                }}
              />
            })}
          </span>
        })}
      </ul >
    </div>
  }

  const prefixCls = 'cate';
  return (<>
    <div>
      <Card title={title !== undefined ? title : '选择商品类目'}>
        <div className={styles[`${prefixCls}-boxs`]}>
          {cateShowData?.map((item, index) => {
            const { level, showData, currCate } = item;
            return <Spin key={index} loading={loading && loadingLevel == level} tip='拼命加载中...'
              className={styles[`${prefixCls}-box`]}>
              <Input allowClear
                onChange={(value) => handleSeach(value, item)}
                placeholder="输入分类名搜索"
                className={styles[`${prefixCls}-seach`]}
                suffix={<IconSearch />}
              />
              <CateList
                level={level}
                data={showData}
                value={currCate}
                onItemClick={async (value) => {
                  await handleCateClick(item, value);
                }}
              />
            </Spin >
          })}
        </div>
        <div>
          <Alert content={`您当前选择的是：${cateNamePath}`} closable={false} />
        </div>
        <div className={styles[`${prefixCls}-bottom`]}>
          <Button
            type='primary'
            loading={submiting}
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
