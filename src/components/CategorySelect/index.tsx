import { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Spin } from "@arco-design/web-react";
import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import styles from './style/index.module.less';
import { CategorySelectProps } from "./interface";
import { IconSearch } from "@arco-design/web-react/icon";
import classNames from "@arco-design/web-react/es/_util/classNames";
import { debounce } from "lodash";
import { getList } from "./api";

const defaultProps: CategorySelectProps = {

};

type CateShowData = {
  lv: number,
  name?: string,
  value?: string,
  seachValue?: string,
  data?: { name?: string }[],
  showData?: {
    gName?: string,
    vals?: any[],
    name?: string
  }[]
};
function CategorySelect(baseProps: CategorySelectProps) {
  const props = useMergeProps<CategorySelectProps>(baseProps, defaultProps, {});
  const [loading, setLoading] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [cateData, setCateData] = useState({ id: 0, path: [{ id: '', name: '' }] });
  const [cateShowData, setCateShowData] = useState<CateShowData[]>([{ lv: 1, name: "", value: "", data: [] }]);

  const cateNamePath = cateData.path.map(m => m.name).join(" > ");

  useEffect(() => {
    loadCateList(1, 0);
  }, [])

  const loadCateList = debounce(async function (lv: number, parentId?: number) {
    setLoading(true);
    try {
      const data = await getList({ parentId });
      setCateShowData(value => {
        const newData = value.filter(f => f.lv !== lv);
        const showData = groupShowData(data);
        newData.push({ lv: lv, showData, data });
        return newData;
      });
    } catch (error) {

    } finally {
      setLoading(false);
    }
  }, 500);

  function groupShowData(data: any) {
    let vals: any = []; //[{ gName: "", vals: [] }];
    const tempData = data || [];
    tempData.forEach((f: any) => {
      const tempVal = vals.find((fi: any) => fi.gName == f.groupName);
      if (tempVal) {
        tempVal.vals.push(f);
      } else {
        vals.push({ gName: f.groupName, vals: [f] });
      }
    });
    return vals;
  }

  function handleSeach(seachValue: string, cate: CateShowData): void {
    if (seachValue && cate.data) {
      const tempShowData = cate.data.filter(
        f => cate?.seachValue && f.name && f.name?.indexOf(cate?.seachValue) > -1
      );
      cate.showData = groupShowData(tempShowData);
    } else {
      cate.showData = groupShowData(cate.data);
    }
  }

  async function handleCateClick(cate: CateShowData, item: any) {
    const parentId = item.id;
    const lv = cate.lv;

    cate.value = item.id;
    cate.name = item.name;

    if (item.isParent) {
      setCateShowData(value => {
        return value.filter(f => f.lv <= lv);;
      });
      await loadCateList(lv + 1, parentId);
      // item.loading = true;
      // this.$api.category
      //   .getSubList({ isActive: true, parentId: item.id })
      //   .then(data => {
      //     this.cateShowData.push({
      //       lv: cate.lv + 1,
      //       value: "",
      //       showData: this.groupShowData(data),
      //       data: data
      //     });
      //     item.loading = false;
      //   })
      //   .catch(() => {
      //     item.loading = false;
      //   });
    }

    cateData.id = item.isParent ? 0 : parentId
    cateData.path = [];
    cateShowData.forEach((f, index) => {
      if (f.name) {
        cateData.path.push({ id: f.value, name: f.name });
      }
    });
  }

  function handleOk(e: Event): void {
    //   this.submiting = true;
    //   const promise = new Promise((resolve, reject) => {
    //     this.$emit("ok", this.cateData, resolve);
    //   });
    //   promise.then(data => {
    //     this.submiting = false;
    //   });

    // setSubmiting(true);
    // try {
    //   const data = await getList(cateData);
    // } catch (error) {

    // } finally {
    //   setSubmiting(false);
    // }
  }






  function CateItem(props: any) {
    const { isParent, name, id } = props;
    return <li onClick={(() => { handleCateClick(cate, val); })}
      className={classNames({ ['active']: id == cate.value })}>
      <span className="el-cascader-node__label">{name}</span>
      {isParent && <i className={classNames(
        'el-cascader-node__postfix', {
        ['el-icon-loading']: val?.loading,
        ['el-icon-arrow-right']: !val?.loading,
      })} />}
    </li>
  }


  const prefixCls = 'cate';
  return (<>
    <div>
      <Card title={'选择商品类目'}>
        {cateShowData?.map((cate, index) => {
          return <Spin key={index} loading={loading} tip='拼命加载中...'
            className={styles[`${prefixCls}-box`]}>
            <Input allowClear
              onChange={(value) => handleSeach(value, cate)}
              placeholder="输入分类名搜索"
              className={styles[`${prefixCls}-seach`]}
              suffix={<IconSearch />}
            />
            <div className={styles[`${prefixCls}-list`]}>
              <ul>
                {cate?.showData?.map((item, index) => {
                  return <span key={index}>
                    {item?.gName && <div className={styles['gname']}>{item.gName}</div >}
                    {item?.vals?.map((val, i) => {
                      return <li key={i} onClick={(() => { handleCateClick(cate, val); })}
                        className={classNames({ ['active']: val.id == cate.value })}>
                        <span className="el-cascader-node__label">{val.name}</span>
                        {val.isParent && <i className={classNames(
                          'el-cascader-node__postfix', {
                          ['el-icon-loading']: val?.loading,
                          ['el-icon-arrow-right']: !val?.loading,
                        })} />}
                      </li>
                    })}
                  </span>
                })}
              </ul >
            </div>
          </Spin >
        })}
        <div>
          <Alert content={`您当前选择的是：${cateNamePath}`} closable={false} />
        </div>
        <div className={styles[`${prefixCls}-bottom`]}>
          <Button
            type='primary'
            loading={submiting}
            disabled={cateData.id === 0}
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
