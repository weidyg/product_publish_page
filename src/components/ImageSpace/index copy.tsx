import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { ImageInfo, ImageSpaceProps, SpaceInfo } from "./interface";
import { Alert, Button, Divider, Input, Layout, Link, List, Message, Progress, Select, Space, Spin, Upload } from "@arco-design/web-react";
import { IconApps, IconList, IconSearch } from "@arco-design/web-react/icon";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from './style/index.module.less';
import classNames from "@arco-design/web-react/es/_util/classNames";
import { isNumber } from "@arco-design/web-react/es/_util/is";
import { getImagePageList } from "../api";
import { convertByteUnit, isAcceptFile } from "../until";
import { debounce, throttle } from "lodash";

const sortOptions = [
  { label: "按时间升序", value: "timeAsc", },
  { label: "按时间降序", value: "timeDes", },
  { label: "按图片名升序", value: "nameAsc", },
  { label: "按图片名降序", value: "nameDes", },
];
const sortMap: any = {
  timeAsc: { name: 'CreationTime', asc: true },
  timeDes: { name: 'CreationTime', asc: false },
  nameAsc: { name: 'FileName', asc: true },
  nameDes: { name: 'FileName', asc: false },
}


const defaultProps: ImageSpaceProps = {
  pageSize: 20
};

function ImageSpace(baseProps: ImageSpaceProps) {
  const props = useMergeProps<ImageSpaceProps>(baseProps, defaultProps, {});
  const { pageSize, onItemClick } = props;

  const [sort, setSort] = useState<string>(sortOptions[0].value);
  const [keyword, setKeyword] = useState<string>();
  const [folderId, setFolderId] = useState<number>();

  const [query, setQuery] = useState<boolean>(false);
  const [showMode, setShowMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  // const [currentPage, setCurrentPage] = useState<number>();


  const [files, SetFiles] = useState<ImageInfo[]>([]);
  const [spaceInfo, setSpaceInfo] = useState<SpaceInfo>({});

  useEffect(() => {
    fetchData(1);
  }, [sort]);

  const fetchData = async (pageNo: number) => {
    try {
      setLoading(true);
      const sortVal = sortMap[sort];
      const { total, items } = await getImagePageList({
        pageNo, pageSize, keyword, folderId,
        sortName: sortVal.name,
        sortAsc: sortVal.asc,
        refType: 'product',
      });
      setHasNextPage((pageNo * pageSize) < total);
      SetFiles((files) => pageNo == 1 ? items : files.concat(...items));
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  function loadMoreData() {
    if (hasNextPage) {
      const pageNo = Math.floor((files?.length || 0) / pageSize);
      fetchData(pageNo + 1);
    }
  }

  function handlerItemClick(value: any) {
    onItemClick && onItemClick(value);
  }

  const [percent, usedSize, totalSize] = useMemo(() => {
    const { used, total, free } = spaceInfo;
    const percent = isNumber(used) && isNumber(total) && total > 0 ? ((used / total) * 100) : 0;
    const usedSize = convertByteUnit(used) || '--';
    const totalSize = convertByteUnit(total) || '--';
    const freeSize = convertByteUnit(free) || '--';
    return [percent, usedSize, totalSize, freeSize];
  }, [JSON.stringify(spaceInfo)])

  function ImgListItem(props: any) {
    const { id, name, url, pix, size, time } = props;
    const imgRef = useRef<HTMLImageElement>(null);
    // const [pix, setPix] = useState(propPix);
    // useEffect(() => {
    //   if (imgRef?.current) {
    //     setPix(imgRef.current.naturalWidth + 'x' + imgRef.current.naturalHeight);
    //   }
    // }, [])
    const listOnly = showMode == 'list';
    return <div className={classNames(styles['item'], styles['pic'])}
      onClick={() => { handlerItemClick(props); }}
    >
      <div className={classNames(styles['cover'], styles['list-item'])}>
        <img ref={imgRef} alt={name} src={url} />
        <div className={styles['mask']}></div>
        {pix && <div className={classNames(styles['pix'], styles['block-only'])}>{pix}</div>}
      </div>
      <div className={classNames({ [styles['list-item']]: listOnly, [styles['list-only']]: listOnly }, styles['name'])} title={name}>{id}_{name}</div>
      <div className={classNames(styles['list-item'], styles['list-only'], styles['size'])}>{pix || '--'}</div>
      <div className={classNames(styles['list-item'], styles['list-only'], styles['size'])}>{convertByteUnit(size)}</div>
      <div className={classNames(styles['list-item'], styles['list-only'], styles['date'])}>{time}</div>
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
                <div className={styles["bar"]}>
                  <Space>
                    <div className={classNames(styles['icon-btn'], { [styles['active']]: showMode == 'grid' })}>
                      <IconApps onClick={() => { setShowMode('grid'); }} />
                    </div>
                    <div className={classNames(styles['icon-btn'], { [styles['active']]: showMode == 'list' })}>
                      <IconList onClick={() => { setShowMode('list'); }} />
                    </div>
                    <Select
                      options={sortOptions}
                      value={sort}
                      onChange={(value) => { setSort(value); }}
                      style={{ width: 160 }}
                    />
                    <Input
                      placeholder='请输入按回车搜索'
                      suffix={<IconSearch />}
                      value={keyword}
                      onChange={(value) => { setKeyword(value); }}
                      onPressEnter={() => { fetchData(1); }}
                      style={{ width: 180 }}
                    />
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
                {/* <div className={classNames(styles['list-items'], { [styles['lists']]: showMode == 'list' })}>
                  {showMode == 'list' && <div className={classNames(styles['item'], styles['item-title'])}>
                    <div className={classNames(styles['list-item'], styles['cover'])} style={{ height: '32px' }}></div>
                    <div className={classNames(styles['list-item'], styles['name'])}>名称</div>
                    <div className={classNames(styles['list-item'], styles['size'])}>分辨率</div>
                    <div className={classNames(styles['list-item'], styles['size'])}>大小</div>
                    <div className={classNames(styles['list-item'], styles['date'])}>修改时间</div>
                  </div>}
                  {files?.map((m, i) => {
                    return <ImgListItem key={i} {...m} />
                  })}
                </div> */}
                <List
                  bordered={false}
                  dataSource={files}
                  wrapperClassName={classNames(styles['list-items'], { [styles['lists']]: showMode == 'list' })}
                  header={showMode == 'list' && <div className={classNames(styles['item'], styles['item-title'])}>
                    <div className={classNames(styles['list-item'], styles['cover'])} style={{ height: '32px' }}></div>
                    <div className={classNames(styles['list-item'], styles['name'])}>名称</div>
                    <div className={classNames(styles['list-item'], styles['size'])}>分辨率</div>
                    <div className={classNames(styles['list-item'], styles['size'])}>大小</div>
                    <div className={classNames(styles['list-item'], styles['date'])}>修改时间</div>
                  </div>}
                  render={(item, index) => (
                    <ImgListItem key={index} {...item} />
                  )}
                  scrollLoading={
                    loading
                      ? <Spin loading={loading} />
                      : <Divider style={{ margin: '0' }}>{
                        hasNextPage
                          ? <Link onClick={() => { loadMoreData(); }}>加载更多...</Link>
                          : <>没有更多数据</>
                      }
                      </Divider>
                  }
                  onReachBottom={(currentPage) => {
                    loadMoreData();
                  }}
                />
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
    </div >
  </>
  );
}


export default ImageSpace;
