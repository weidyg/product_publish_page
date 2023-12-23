import useMergeProps from "@arco-design/web-react/es/_util/hooks/useMergeProps";
import { ImageInfo, ImageSpaceProps, ImageUploadInfo, SpaceInfo } from "./interface";
import { Button, Divider, Input, Link, List, Message, Modal, Progress, Select, Space, Tree, Typography, Upload } from "@arco-design/web-react";
import { IconApps, IconCheck, IconList, IconRefresh, IconSearch } from "@arco-design/web-react/icon";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from './style/index.module.less';
import classNames from "@arco-design/web-react/es/_util/classNames";
import { isNumber } from "@arco-design/web-react/es/_util/is";
import { convertByteUnit, convertTime, isAcceptFile, thumbnail } from "../product-edit/until";
import { debounce, set, throttle } from "lodash";
import { RequestOptions, UploadItem } from "@arco-design/web-react/es/Upload";
import { TreeDataType } from "@arco-design/web-react/es/Tree/interface";
import uploadRequest from "./request";
import { getImagePageList } from "./api";

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

const defaultFoldeData = [
  {
    key: '',
    title: '我的图片',
  }
];

const defaultProps: ImageSpaceProps = {
  pageSize: 20
};

function ImageSpace(baseProps: ImageSpaceProps) {
  const props = useMergeProps<ImageSpaceProps>(baseProps, defaultProps, {});
  const { style, className, pageSize, multiSelect, onChange } = props;

  const [sort, setSort] = useState<string>(defaultSort);
  const [keyword, setKeyword] = useState<string>();
  const [folderId, setFolderId] = useState<number>();
  const [uploadFolderId, setUploadFolderId] = useState<number>();
  const [foldeData, setFoldeData] = useState<TreeDataType[]>(defaultFoldeData);

  const [showMode, setShowMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadMoreing, setLoadMoreing] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>();

  const [files, setFiles] = useState<ImageInfo[]>([]);
  const [spaceInfo, setSpaceInfo] = useState<SpaceInfo>({});
  const [uploadList, setUploadList] = useState<UploadItem[]>([]);


  const [selectFiles, setSelectFiles] = useState<ImageInfo[]>([]);

  const selectConfirm = multiSelect;

  function handlerItemClick(value: ImageInfo) {
    if (selectConfirm) {
      let newSelectFiles = [...selectFiles];
      if (newSelectFiles.some(e => e.id == value.id)) {
        newSelectFiles = newSelectFiles.filter(e => e.id != value.id);
      } else {
        newSelectFiles.push(value);
      }
      setSelectFiles(newSelectFiles)
    } else {
      handleChange([value]);
    }
  }

  function handleChange(values: ImageInfo[]) {
    // console.log('handleChange',values,onChange);
    onChange && onChange(values);
    setSelectFiles([]);
  }

  useEffect(() => {
    refreshData();
  }, [sort]);

  useEffect(() => {
    if ((uploadList?.length || 0) == 0) { return; }
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
      // setTimeout(() => {
      const pageNo = Math.floor((files?.length || 0) / pageSize);
      fetchData(pageNo + 1);
      // }, 100);
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
    } catch (error: any) {
      Message.info(error?.message);
    } finally {
      setLoading(false);
      setLoadMoreing(false);
    }
  };

  function chenckFile(file: File) {
    const size = file?.size || 0;
    const isAccept = isAcceptFile(file, ['image/jpg', 'image/jpeg', 'image/gif', 'image/png']);
    // console.log('isAccept', isAccept);
    if (!isAccept || size > 3 * 1024 * 1024) {
      Message.error('仅支持3MB以内jpg、jpeg、gif、png格式图片上传~');
      return false;
    }
    return true;
  }

  const [usedPercent, usedSize, totalSize] = useMemo(() => {
    const { used, total, free } = spaceInfo;
    const percent = isNumber(used) && isNumber(total) && total > 0 ? ((used / total) * 100) : 0;
    const usedSize = convertByteUnit(used) || '--';
    const totalSize = convertByteUnit(total) || '--';
    const freeSize = convertByteUnit(free) || '--';
    return [percent, usedSize, totalSize, freeSize];
  }, [JSON.stringify(spaceInfo)])

  const uploads = useMemo(() => {
    const uploadInfos: ImageUploadInfo[] = uploadList?.map((item, i) => {
      const { uid, percent: p = 0, status, name, url, originFile, response } = item || {};
      const { size, lastModified } = originFile || {};
      const m = (response as ImageInfo) || {};
      const time = convertTime(lastModified);
      const percent = status == 'uploading' ? p == 100 ? 99 : p : p;
      return { name, url, size, time, uid, percent, status, ...m }
    }) || [];
    return uploadInfos;
  }, [JSON.stringify(uploadList)])

  function ImgListItem(props: ImageUploadInfo & { error?: any }) {
    const { error, status, percent = 0, name, url, pix, size, time } = props;
    // console.log('ImgListItem', props);
    const imgRef = useRef<HTMLImageElement>(null);
    const listOnly = showMode == 'list';

    const coverSize = listOnly ? 40 : 100;
    return <div className={classNames(styles['item'], styles['pic'])}
      onClick={() => { url && handlerItemClick(props); }}
    >
      <div className={classNames(styles['select-icon'], styles['list-item'], {
        [styles['angle']]: multiSelect,
        [styles['active']]: selectFiles.some(e => e.id == props.id)
      })}>
        <IconCheck fontSize={14} />
      </div>
      <div className={classNames(styles['cover'], styles['list-item'])}
        style={{ height: `${coverSize}px`, width: `${coverSize}px`, lineHeight: `${coverSize}px` }}>
        {(status && status != 'done')
          ? <div title={error?.message}>
            <Progress
              type='circle'
              percent={percent}
              size={listOnly ? 'mini' : 'default'}
              status={status == 'error' ? 'error' : undefined}
              className={classNames(styles['progress'])}
              style={{ height: `${coverSize}px`, width: `${coverSize}px` }}
            />
          </div>
          : <img ref={imgRef} alt={name} src={thumbnail(url, coverSize, coverSize)} />
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

  function LoadMoreDivider() {
    return <div className={styles['load-more-text']}>{
      hasNextPage === true
        ? <Button type='text'
          loading={loadMoreing}
          onClick={() => { loadMoreData(); }}
          loadingFixedWidth={true}>
          {loadMoreing ? '加载中...' : '加载更多...'}
        </Button>
        : hasNextPage === false
          ? <span>没有更多了</span>
          : <></>
    }</div>
  }

  const [wrapperStyle, setWrapperStyle] = useState({});
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (barRef.current) {
      const height = barRef.current.clientHeight;
      const newWrapperStyle = {
        ...wrapperStyle,
        marginTop: `${height}px`,
        height: `calc(100% - ${height}px)`,
      };
      setWrapperStyle(newWrapperStyle);
    }
  }, [barRef?.current?.clientHeight])

  return (<>
    <div className={classNames(styles["layout"], className)} style={{ ...style, padding: '0px' }}>
      <div className={styles["topAlert"]} style={{ display: 'block' }}>欢迎使用图片空间</div>
      <div className={classNames(styles["container"], styles["hasTopAlert"])} >
        <div style={{ display: 'none' }}></div>
        <div className={styles["main"]} >
          <div className={styles["selector"]}
          // style={{ display: showUpload ? 'none' : 'block' }}
          >
            <div className={styles["body"]} >
              <div className={styles["cates"]} >
                <Tree defaultSelectedKeys={['']}
                  treeData={foldeData}
                  showLine={true} />
              </div>
              <div className={styles["list"]} >
                <div ref={barRef} className={styles["bar"]}>
                  <Space style={{ marginBottom: '4px' }}>
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
                  <Space style={{ float: 'right', marginBottom: '4px' }}>
                    <div>
                      <div>{`已用 ${usedSize} / ${totalSize}`}</div>
                      <Progress showText={false} animation width={200} style={{ display: 'block' }}
                        status={usedPercent > 90 ? 'error' : usedPercent > 80 ? 'warning' : 'normal'}
                        percent={usedPercent} />
                    </div>
                    <Button
                      onClick={() => {
                        setShowUpload(true);
                        setUploadList([]);
                      }}
                      style={{ zIndex: 100 }}
                    >上传图片</Button>
                  </Space>
                </div>
                <List
                  loading={loading}
                  bordered={false}
                  dataSource={uploads.concat(...files)}
                  wrapperStyle={wrapperStyle}
                  wrapperClassName={classNames(styles['list-items'], {
                    [styles['lists']]: showMode == 'list',
                    [styles['show-select']]: selectConfirm
                  })}
                  header={showMode == 'list' && <div className={classNames(styles['item'], styles['item-title'])}>
                    {selectConfirm && <div className={classNames(styles['list-item'])} style={{ width: '10px' }}></div>}
                    <div className={classNames(styles['list-item'], styles['cover'])}></div>
                    <div className={classNames(styles['list-item'], styles['name'])}>名称</div>
                    <div className={classNames(styles['list-item'], styles['size'])}>分辨率</div>
                    <div className={classNames(styles['list-item'], styles['size'])}>大小</div>
                    <div className={classNames(styles['list-item'], styles['date'])}>修改时间</div>
                  </div>}
                  render={(item, index) => (
                    <ImgListItem key={index} {...item} />
                  )}
                  offsetBottom={200}
                  scrollLoading={LoadMoreDivider()}
                  onReachBottom={() => {
                    loadMoreData();
                  }}
                />
              </div>
            </div>
            <div className={styles["footer"]}>
              <Space></Space>
              <Space style={{ float: 'right' }}>
                {selectConfirm && <Button
                  type='primary'
                  onClick={() => { handleChange(selectFiles); }}
                  style={{ width: '98px' }} >
                  确认
                </Button>}
              </Space>
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
              tip='仅支持3MB以内jpg、jpeg、gif、png格式图片上传'
              accept='image/*'
              name={'file'}
              data={{
                folderId: uploadFolderId
              }}
              beforeUpload={(file: File) => {
                // console.log('beforeUpload', file);
                const chenck = chenckFile(file);
                if (chenck) { setShowUpload(false); }
                return chenck;
              }}
              customRequest={(options: RequestOptions) => {
                const { file, data: originData = {}, ...rest } = options;
                let img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = function () {
                  const pix = img.width > 0 && img.height > 0
                    ? `${img.width}x${img.height}`
                    : undefined;
                  const data = { ...originData, pix };
                  return uploadRequest({ ...rest, file, data });
                }
              }}
              // onDrop={(e) => {
              //   let file = e.dataTransfer.files[0];
              //   return chenckFile(file);
              // }}
              onProgress={(file: UploadItem, e?: ProgressEvent) => {
                // console.log('onProgress', file);
                setUploadList((v) => {
                  return v.map((x) => {
                    return x.uid === file.uid ? file : x;
                  });
                });
              }}
              onChange={(fileList: UploadItem[], file: UploadItem) => {
                // console.log('onChange',fileList, file);
                setUploadList(fileList);
              }}
            />
          </Modal>
        </div>
      </div>
    </div >
  </>
  );
}


export default ImageSpace;
