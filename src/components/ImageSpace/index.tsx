import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { ImageInfo, ImageSpaceProps } from "./interface";
import { Alert, Button, Input, Layout, List, Message, Progress, Select, Space, Upload } from "@arco-design/web-react";
import { IconApps, IconList, IconSearch } from "@arco-design/web-react/icon";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from './style/index.module.less';
import classNames from "@arco-design/web-react/es/_util/classNames";
import { isNumber } from "@arco-design/web-react/es/_util/is";
import { getImagePageList } from "../api";

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
  const [sort, setSort] = useState(sortOptions[0].value);
  function handlerSortChange(value: any) {
    setSort(value);
  }

  const [spaceInfo, setSpaceInfo] = useState({
    used: undefined,
    total: undefined,
    free: undefined,
  });

  const [files, SetFiles] = useState<ImageInfo[]>([]);

  const sortMap: any = {
    timeAsc: { name: 'CreationTime', asc: true },
    timeDes: { name: 'CreationTime', asc: false },
    nameAsc: { name: 'FileName', asc: true },
    nameDes: { name: 'FileName', asc: false },
  }

  useEffect(() => {
    loadMore();
  }, []);

  async function loadMore() {
    const pageNo = 1;
    const pageSize = 20;
    const folderId = 0;
    const sortVal = sortMap[sort];
    const data = await getImagePageList(folderId, 'product', sortVal.name, sortVal.asc, pageNo, pageSize);
    SetFiles(data?.items);
  }



  const unitSizes = {
    K: 1.0,
    M: 1.0 * 1024,
    G: 1.0 * 1024 * 1024,
    T: 1.0 * 1024 * 1024 * 1024,
    P: 1.0 * 1024 * 1024 * 1024 * 1024,
  }

  const convertSizeUnit = (size?: number, precision: number = 2) => {
    if (size === undefined) { return ''; }
    if (size < unitSizes.M) { return `${size?.toFixed(precision)}K`; }
    if (size < unitSizes.G) { return `${(size / unitSizes.M)?.toFixed(precision)}M`; }
    if (size < unitSizes.T) { return `${(size / unitSizes.G)?.toFixed(precision)}G`; }
    if (size < unitSizes.P) { return `${(size / unitSizes.T)?.toFixed(precision)}T`; }
  }

  const [percent, usedSize, totalSize] = useMemo(() => {
    const { used, total, free } = spaceInfo;
    const percent = isNumber(used) && isNumber(total) && total > 0 ? ((used / total) * 100) : 0;
    const usedSize = convertSizeUnit(used) || '--';
    const totalSize = convertSizeUnit(total) || '--';
    const freeSize = convertSizeUnit(free) || '--';
    return [percent, usedSize, totalSize, freeSize];
  }, [JSON.stringify(spaceInfo)])

  const [showMode, setShowMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);

  const isAcceptFile = (file: File, accept: string) => {
    if (accept && file) {
      const accepts = Array.isArray(accept) ? accept : accept.split(',').map((x) => x.trim()).filter((x) => x);
      const fileExtension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : '';
      return accepts.some((type) => {
        const text = type && type.toLowerCase();
        const fileType = (file.type || '').toLowerCase();
        if (text === fileType) { return true; }
        if (new RegExp('\/\*').test(text)) {
          const regExp = new RegExp('\/.*$')
          return fileType.replace(regExp, '') === text.replace(regExp, '');
        }
        if (new RegExp('\..*').test(text)) {
          return text === `.${fileExtension && fileExtension.toLowerCase()}`;
        }
        return false;
      });
    }
    return !!file;
  }

  function ImgBlock(props: any) {
    const { src } = props;
    const imgRef = useRef<HTMLImageElement>(null);
    const pix = useMemo(() => {
      if (imgRef?.current) {
        return imgRef.current.naturalWidth + 'x' + imgRef.current.naturalHeight;
      }
    }, [imgRef?.current]);

    console.log(imgRef.current);
    return <div className={classNames(styles['cover'], styles['list-item'])}>
      <img ref={imgRef} src={src} />
      <div className={styles['mask']}></div>
      <div className={classNames(styles['pix'], styles['block-only'])}>{pix}</div>
    </div>
  }
  return (<>
    <div className={styles["layout"]} style={{ padding: '0px' }}>
      <div className={styles["topAlert"]} style={{ display: 'block' }}>欢迎使用图片空间</div>
      <div className={classNames(styles["container"], styles["hasTopAlert"])} >
        <div style={{ display: 'none' }}></div>
        <div className={styles["main"]} >
          <div className={styles["selector"]} style={{ display: showUpload ? 'none' : 'block' }}>
            <div className={styles["body"]} >
              <div className={styles["cates"]} >

              </div>
              <div className={styles["list"]} >
                <div className={styles["bar"]} >
                  <Space>
                    <div className={classNames(styles['icon-btn'], { [styles['active']]: showMode == 'grid' })}>
                      <IconApps onClick={() => { setShowMode('grid'); }} />
                    </div>
                    <div className={classNames(styles['icon-btn'], { [styles['active']]: showMode == 'list' })}>
                      <IconList onClick={() => { setShowMode('list'); }} />
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
                    <Button onClick={() => { setShowUpload(true); }}>上传图片</Button>
                  </Space>
                </div>
                <div className={classNames(styles['list-items'], { [styles['lists']]: showMode == 'list' })}>
                  <div>
                    {showMode == 'list' && <div className={classNames(styles['item'], styles['item-title'])}>
                      <div className={classNames(styles['list-item'], styles['no-select'])}></div>
                      <div className={classNames(styles['list-item'], styles['cover'])} style={{ height: '32px' }}></div>
                      <div className={classNames(styles['list-item'], styles['name'])}>名称</div>
                      <div className={classNames(styles['list-item'], styles['size'])}>分辨率</div>
                      <div className={classNames(styles['list-item'], styles['size'])}>大小</div>
                      <div className={classNames(styles['list-item'], styles['date'])}>修改时间</div>
                    </div>}
                    {files?.map((m, i) => {
                      return <div key={i} className={classNames(styles['item'], styles['pic'])}>
                        <ImgBlock src={m.url} />
                        {/* <div className={classNames(styles['cover'], styles['list-item'])}>
                          <img src={m.url} />
                          <div className={styles['mask']}></div>
                          <div className={classNames(styles['pix'], styles['block-only'])}>{m.pix}</div>
                        </div> */}
                        <div title="20978903363670.jpg" className={styles['name']}> {m.name}</div>
                        <div className={classNames(styles['list-item'], styles['list-only'], styles['size'])}>{m.pix}</div>
                        <div className={classNames(styles['list-item'], styles['list-only'], styles['size'])}>{convertSizeUnit(m.size)}</div>
                        <div className={classNames(styles['list-item'], styles['list-only'], styles['date'])}>{m.time}</div>
                      </div>
                    })}

                  </div>
                </div>
              </div>
            </div>
            <div className={styles["footer"]}>
              <Space></Space>
              <Space style={{ float: 'right' }}></Space>
            </div>
          </div>
          <div className={styles["uploader"]} style={{ display: showUpload ? 'block' : 'none' }}>
            <div className={styles["pre-upload"]} >
              <div className={styles["drop-zoom"]} style={{ position: 'relative' }}>
                <div className={styles["bar"]}>

                </div>
                <div className={styles["drop-inner"]}>
                  {/* <Upload
                    action='/'
                    onChange={(fileList, file) => {
                      console.log(fileList, file);
                    }}
                  >
                    <div className='trigger'>
                      <div>
                        Drag the file here or
                        <span style={{ color: '#3370FF', padding: '0 4px' }} >
                          Click to upload
                        </span>
                      </div>
                    </div>
                  </Upload> */}

                  <Upload drag multiple accept='image/*'
                    action='http://localhost:60486/api/services/app/ProductPublish/UploadImages'
                    name={'file'}
                    data={{
                      shopId: 1,
                      productId: 1,
                    }}
                    onDrop={(e) => {
                      let uploadFile = e.dataTransfer.files[0]
                      if (!isAcceptFile(uploadFile, 'image/*')) {
                        Message.info('不接受的文件类型，请重新上传指定文件类型~');
                      }
                    }}
                    tip='Only pictures can be uploaded'
                  />

                </div>
              </div>
              <div className={styles["footer"]}>
                <Space></Space>
                <Space style={{ float: 'right' }}>
                  <Button type='outline' onClick={() => { setShowUpload(false); }}>取消</Button>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}


export default ImageSpace;
