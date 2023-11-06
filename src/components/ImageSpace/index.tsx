import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { ImageInfo, ImageSpaceProps, ImageUploadInfo, SpaceInfo } from "./interface";
import { Alert, Button, Divider, Input, Layout, Link, List, Message, Modal, Progress, Select, Space, Spin, Upload } from "@arco-design/web-react";
import { IconApps, IconList, IconRefresh, IconSearch } from "@arco-design/web-react/icon";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from './style/index.module.less';
import classNames from "@arco-design/web-react/es/_util/classNames";
import { isNumber } from "@arco-design/web-react/es/_util/is";
import { getImagePageList } from "../api";
import { convertByteUnit, convertTime, isAcceptFile } from "../until";
import { debounce, throttle } from "lodash";
import { UploadItem, UploadStatus } from "@arco-design/web-react/es/Upload";

const defaultSort = "timeDes";
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

  const [sort, setSort] = useState<string>(defaultSort);
  const [keyword, setKeyword] = useState<string>();
  const [folderId, setFolderId] = useState<number>();

  const [showMode, setShowMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadMoreing, setLoadMoreing] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  // const [currentPage, setCurrentPage] = useState<number>();

  const [files, setFiles] = useState<ImageInfo[]>([]);
  const [spaceInfo, setSpaceInfo] = useState<SpaceInfo>({});
  const [uploadList, setUploadList] = useState<UploadItem[]>([]);

  useEffect(() => {
    refreshData();
  }, [sort]);

  useEffect(() => {
    if (uploadList?.length || 0 == 0) { return; }
    if (uploadList.every(e => e.status == 'done')) {
      refreshData();
      setUploadList([]);
    }
  }, [JSON.stringify(uploadList)]);

  const refreshData = throttle(function () {
    setLoading(true);
    fetchData(1);
  }, 500);

  const loadMoreData = debounce(function () {
    if (hasNextPage) {
      setLoadMoreing(true);
      const pageNo = Math.floor((files?.length || 0) / pageSize);
      fetchData(pageNo + 1);
    }
  }, 500);

  const fetchData = async (pageNo: number) => {
    try {
      const sortVal = sortMap[sort];
      const { total, items } = await getImagePageList({
        pageNo, pageSize, keyword, folderId,
        sortName: sortVal.name,
        sortAsc: sortVal.asc,
        refType: 'product',
      });
      setHasNextPage((pageNo * pageSize) < total);
      setFiles((files) => pageNo == 1 ? items : files.concat(...items));
    } catch (error) {

    } finally {
      setLoading(false);
      setLoadMoreing(false);
    }
  };

  function handlerItemClick(value: any) {
    onItemClick && onItemClick(value);
  }
  function chenckFile(file: any) {
    if (!isAcceptFile(file, 'image/*')) {
      Message.info('不接受的文件类型，请重新上传指定文件类型~');
      return false;
    }
    return true;
  }
  const [percent, usedSize, totalSize] = useMemo(() => {
    const { used, total, free } = spaceInfo;
    const percent = isNumber(used) && isNumber(total) && total > 0 ? ((used / total) * 100) : 0;
    const usedSize = convertByteUnit(used) || '--';
    const totalSize = convertByteUnit(total) || '--';
    const freeSize = convertByteUnit(free) || '--';
    return [percent, usedSize, totalSize, freeSize];
  }, [JSON.stringify(spaceInfo)])

  const uploads = useMemo(() => {
    const uploadInfos: ImageUploadInfo[] = uploadList?.map((item, i) => {
      const { uid, percent = 0, status, name, url, originFile, response } = item || {};
      const { size, lastModified } = originFile || {};
      const m = (response as any)?.Result;
      const p = status == 'uploading' ? (percent < 20 ? 20 : percent == 100 ? 99 : percent) : percent;
      return {
        id: m?.Id,
        folderId: m?.FolderId,
        pix: '',
        name: m?.FileName || name,
        url: m?.Url || url,
        size: m?.FileSize || size,
        time: m?.CreationTime || convertTime(lastModified),
        uid,
        percent: p,
        status,
      }
    }) || [];
    return uploadInfos;
  }, [JSON.stringify(uploadList)])

  //'init' | 'uploading' | 'done' | 'error'
  function ImgListItem(props: any) {
    const { status, percent, name, url, pix, size, time } = props;
    const imgRef = useRef<HTMLImageElement>(null);
    const listOnly = showMode == 'list';
    return <div className={classNames(styles['item'], styles['pic'])}
      onClick={() => { handlerItemClick(props); }}
    >
      <div className={classNames(styles['cover'], styles['list-item'])}>
        {(status && status != 'done')
          ? <Progress type='circle'
            percent={percent}
            size={listOnly ? 'mini' : 'large'}
            status={status == 'error' ? 'error' : undefined}
            className={classNames(styles['progress'])} />
          : <img ref={imgRef} alt={name} src={url} />
        }
        <div className={styles['mask']}></div>
        {pix && <div className={classNames(styles['pix'], styles['block-only'])}>{pix}</div>}
      </div>
      <div className={classNames({ [styles['list-item']]: listOnly, [styles['list-only']]: listOnly }, styles['name'])} title={name}>{name}</div>
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
          <div className={styles["selector"]}
          // style={{ display: showUpload ? 'none' : 'block' }}
          >
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
                      onPressEnter={() => { refreshData(); }}
                      style={{ width: 180 }}
                    />
                    <Link hoverable={false}
                      onClick={() => { refreshData(); }}
                      icon={<IconRefresh />}>
                      刷新
                    </Link>
                  </Space>
                  <Space style={{ float: 'right' }}>
                    <div>
                      <div>{`已用 ${usedSize} / ${totalSize}`}</div>
                      <Progress showText={false} animation width={200} style={{ display: 'block' }}
                        status={percent > 90 ? 'error' : percent > 80 ? 'warning' : 'normal'}
                        percent={percent} />
                    </div>
                    <Button onClick={() => {
                      setShowUpload(true);
                      setUploadList([]);
                    }}>上传图片</Button>
                  </Space>
                </div>

                <List
                  loading={loading}
                  bordered={false}
                  dataSource={uploads.concat(...files)}
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
                    loadMoreing
                      ? <Spin loading={loadMoreing} tip="加载中..." />
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
          <Modal
            title={'上传图片'}
            visible={showUpload}
            onCancel={() => { setShowUpload(false); }}
            footer={null}
          >
            <Upload drag multiple
              listType={'picture-list'}
              fileList={uploadList}
              showUploadList={false}
              tip='只能上传图片'
              accept='image/*'
              action='http://localhost:60486/api/services/app/ProductPublish/UploadImages'
              name={'file'}
              data={{ shopId: 1, productId: 1, }}
              beforeUpload={(file) => {
                const chenck = chenckFile(file);
                if (chenck) {
                  setShowUpload(false);
                }
                return chenck;
              }}
              onDrop={(e) => {
                let file = e.dataTransfer.files[0];
                return chenckFile(file);
              }}
              onChange={(fileList: UploadItem[], file: UploadItem) => {
                console.log('fileList', fileList, file);
                setUploadList(fileList);
              }}
            />

          </Modal>
          {/* <div className={styles["uploader"]} style={{ display: showUpload ? 'block' : 'none' }}>
            <div className={styles["pre-upload"]} >
              <div className={styles["drop-zoom"]} style={{ position: 'relative' }}>
                <div className={styles["bar"]}>

                </div>
                <div className={styles["drop-inner"]}>

                  <Upload drag multiple
                    listType={'picture-list'}
                    fileList={uploadList}
                    showUploadList={false}
                    tip='只能上传图片'
                    accept='image/*'
                    action='http://localhost:60486/api/services/app/ProductPublish/UploadImages'
                    name={'file'}
                    data={{ shopId: 1, productId: 1, }}
                    beforeUpload={(file) => {
                      const chenck = chenckFile(file);
                      if (chenck) {
                        setShowUpload(false);
                      }
                      return chenck;
                    }}
                    onDrop={(e) => {
                      let file = e.dataTransfer.files[0];
                      return chenckFile(file);
                    }}
                    onChange={(fileList: UploadItem[], file: UploadItem) => {
                      console.log('fileList', fileList, file);
                      setUploadList(fileList);
                    }}
                  />

                </div>
              </div>
              <div className={styles["footer"]}>
                <Space></Space>
                <Space style={{ float: 'right' }}>
                  <Button type='outline' onClick={() => {
                    setUploadList([]);
                    setShowUpload(false);
                  }
                  }>取消</Button>
                </Space>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div >
  </>
  );
}


export default ImageSpace;
