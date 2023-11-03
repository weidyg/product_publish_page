import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { ImageSpaceProps } from "./interface";
import { Alert, Button, Input, Layout, List, Progress, Select, Space } from "@arco-design/web-react";
import { IconApps, IconList, IconSearch } from "@arco-design/web-react/icon";
import { useMemo, useState } from "react";
import styles from './style/index.module.less';
import classNames from "@arco-design/web-react/es/_util/classNames";

const defaultProps: ImageSpaceProps = {
};

function ImageSpace(baseProps: ImageSpaceProps) {
  const props = useMergeProps<ImageSpaceProps>(baseProps, defaultProps, {});

  const sortOptions = [
    { label: "按时间升序", value: "timeAsc", },
    { label: "按时间降序", value: "timeDes", },
    { label: "按图片名升序", value: "nameAsc", },
    { label: "按图片名降序", value: "nameDes", },
  ];
  const defaultSort = sortOptions?.length > 0 ? sortOptions[0]?.value : '';
  const [sort, SetSort] = useState(defaultSort);
  function handlerSortChange(value: any) {
    SetSort(value);
  }
  const [spaceInfo, SetSpaceInfo] = useState({
    used: 19.58 * 1024,
    total: 1.0 * 1024 * 1024,
    free: 1.0 * 1024 * 1024,
  });

  const unitSizes = {
    K: 1.0,
    M: 1.0 * 1024,
    G: 1.0 * 1024 * 1024,
    T: 1.0 * 1024 * 1024 * 1024,
    P: 1.0 * 1024 * 1024 * 1024 * 1024,
  }

  const convertSizeUnit = (size: number, precision: number = 2) => {
    if (size < unitSizes.M) { return `${size?.toFixed(precision)}K`; }
    if (size < unitSizes.G) { return `${(size / unitSizes.M)?.toFixed(precision)}M`; }
    if (size < unitSizes.T) { return `${(size / unitSizes.G)?.toFixed(precision)}G`; }
    if (size < unitSizes.P) { return `${(size / unitSizes.T)?.toFixed(precision)}T`; }
  }

  const [percent, usedSize, totalSize] = useMemo(() => {
    const { used = 0, total = 0, free = 0 } = spaceInfo;
    const usedSize = convertSizeUnit(used);
    const totalSize = convertSizeUnit(total);
    const freeSize = convertSizeUnit(free);
    const percent = total > 0 ? ((used / total) * 100) : 0;
    return [percent, usedSize, totalSize, freeSize];
  }, [JSON.stringify(spaceInfo)])

  const [showMode, SetShowMode] = useState<'grid' | 'list'>('grid');

  const [files, SetFiles] = useState<any[]>([
    {
      name: '20978903363670.jpg',
      pix: '800x1200',
      size: 211.51,
      url: 'https://img.alicdn.com/imgextra/i1/1035339340/O1CN01uFAvVU2Irm8mOvCCv_!!1035339340.jpg_100x100',
      time: '2023/10/13 09:53:03'
    }, {
      name: '20978903363670.jpg',
      pix: '800x1200',
      size: 211.51,
      url: 'https://img.alicdn.com/imgextra/i1/1035339340/O1CN01uFAvVU2Irm8mOvCCv_!!1035339340.jpg_100x100',
      time: '2023/10/13 09:53:03'
    }
  ]);

  return (<>
    <Layout style={{ height: '400px' }}>
      <Layout.Header>
        <Alert content='欢迎使用图片空间' type='warning' showIcon={false}
          style={{ textAlign: 'center' }} />
      </Layout.Header>
      <Layout>
        <Layout.Sider style={{ padding: '8px 0 0' }}>

        </Layout.Sider>
        <Layout.Content style={{ padding: '8px' }}>
          <div style={{ padding: '0 0 4px' }}>
            <Space>
              <div className={classNames(styles['icon-btn'], { [styles['active']]: showMode == 'grid' })}>
                <IconApps onClick={() => { SetShowMode('grid'); }} />
              </div>
              <div className={classNames(styles['icon-btn'], { [styles['active']]: showMode == 'list' })}>
                <IconList onClick={() => { SetShowMode('list'); }} />
              </div>
              <Select options={sortOptions}
                value={sort} onChange={(value) => {
                  handlerSortChange(value);
                }} style={{ width: 160 }} />
              <Input suffix={<IconSearch />} style={{ width: 180 }} />
            </Space>
            <Space style={{ float: 'right' }}>
              <div>
                <div>{`已用 ${usedSize} / ${totalSize}`}</div>
                <Progress showText={false} animation width={200} style={{ display: 'block' }}
                  status={percent > 90 ? 'error' : percent > 80 ? 'warning' : 'normal'}
                  percent={percent} />
              </div>
              <Button>上传图片</Button>
            </Space>
          </div>
          <div className={classNames(styles['list-items'], { [styles['lists']]: showMode == 'list' })}>
            <div>
              <div className={classNames(styles['item'], styles['item-title'])}>
                <div className={classNames(styles['list-item'], styles['no-select'])}></div>
                <div className={classNames(styles['list-item'], styles['cover'])} style={{ height: '32px' }}></div>
                <div className={classNames(styles['list-item'], styles['name'])}>名称</div>
                <div className={classNames(styles['list-item'], styles['size'])}>分辨率</div>
                <div className={classNames(styles['list-item'], styles['size'])}>大小</div>
                <div className={classNames(styles['list-item'], styles['date'])}>修改时间</div>
              </div>
              {files?.map((m, i) => {
                return <div key={i} className={classNames(styles['item'], styles['pic'])}>
                  <div className={classNames(styles['cover'], styles['list-item'])}>
                    <img src={m.url} />
                    <div className={styles['mask']}></div>
                    <div className={classNames(styles['pix'], styles['block-only'])}>{m.pix}</div>
                  </div>
                  <div title="20978903363670.jpg" className={styles['name']}> {m.name}</div>
                  <div className={classNames(styles['list-item'], styles['list-only'], styles['size'])}>{m.pix}</div>
                  <div className={classNames(styles['list-item'], styles['list-only'], styles['size'])}>{convertSizeUnit(m.size)}</div>
                  <div className={classNames(styles['list-item'], styles['list-only'], styles['date'])}>{m.time}</div>
                </div>
              })}

            </div>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  </>
  );
}


export default ImageSpace;
