import { ReactNode, useState } from 'react';
import { Card, Modal, Popconfirm, Space, Trigger } from '@arco-design/web-react';
import { IconDelete, IconEdit, IconPlus } from '@arco-design/web-react/icon';
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import { ImageUploadProps, ImageUploadSize } from './interface';
import styles from './style/index.module.less';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import ImageSpace from '../ImageSpace';
import { ImageInfo } from '../ImageSpace/interface';
import classNames from '@arco-design/web-react/es/_util/classNames';

const defaultProps: ImageUploadProps = {
  size: 'default',
  text: '',
  value: ''
};

const createFile = (value?: string) => {
  return value ? { url: value } : undefined;
}

function ImageUpload(baseProps: ImageUploadProps) {
  const props = useMergeProps<ImageUploadProps>(baseProps, defaultProps, {});
  const { size, text, onChange, ...rest } = props;

  const [imgInfo, setImgInfo] = useMergeValue<ImageInfo | undefined>(undefined, {
    defaultValue: 'defaultValue' in props ? createFile(props.defaultValue) : undefined,
    value: 'value' in props ? createFile(props.value) : undefined,
  });

  const handleChange = (file?: ImageInfo) => {
    if (file?.url != imgInfo?.url) {
      if (!('value' in props)) { setImgInfo(file); }
      onChange && onChange(file?.url);
    }
  }

  const handleDelete = () => {
    handleChange(undefined);
  }

  function UploadImageTrigger(props: { children?: ReactNode }) {
    const { children } = props;
    const _children = <div onClick={() => setVisible(true)}> {children}</div>;
    const [visible, setVisible] = useState(false);
    return <> <Trigger
      popupVisible={visible}
      popup={() => <Card>
        <ImageSpace
          pageSize={20}
          onItemClick={(file) => {
            if (file?.url) { handleChange(file); }
            setVisible(false);
          }}
          style={{ width: '750px', height: '450px', padding: '10px 0 0 0' }}
        />
      </Card>
      }
      trigger='click'
      classNames='zoomInTop'
      popupAlign={{ top: 8, bottom: 8 }}
      onVisibleChange={(visible) => {
        setVisible(visible);
      }}
    >
      {_children}
    </Trigger>
    </>
  }

  function ShowImage(props: {
    size?: ImageUploadSize,
    onEditClick?: () => void,
  }) {
    const { size = 'default', onEditClick } = props;
    return <>
      <div className={`${styles['upload-picture']} ${styles[size]}`} >
        <img className={styles['upload-picture-image']} src={imgInfo?.url} />
        {size != 'mini' &&
          <div className={styles['upload-picture-mask']}>
            <Space size={'medium'}>
              {onEditClick
                ? <IconEdit style={{ cursor: 'pointer' }} onClick={onEditClick} />
                : <UploadImageTrigger>
                  <IconEdit style={{ cursor: 'pointer' }} />
                </UploadImageTrigger>}
              <IconDelete
                style={{ cursor: 'pointer' }}
                onClick={handleDelete}
              />
            </Space>
          </div>
        }
      </div>
    </>
  }

  function MiniUploadImage(props: {}) {
    const [visible, setVisible] = useState(false);
    return <>
      <Modal maskClosable={false}
        title={<div style={{ textAlign: 'left' }}>上传图片</div>}
        visible={visible}
        onCancel={() => { setVisible(false); }}
        footer={null}
        className={styles['upload-picture-modal']}
        style={{ width: '800px', height: '500px', padding: '0' }}
      >
        <ImageSpace
          pageSize={20}
          onItemClick={(file) => {
            if (file?.url) { handleChange(file); }
            setVisible(false);
          }}
          style={{ width: '750px', height: '450px', padding: '10px 0 0 0' }}
        />
      </Modal>
      {imgInfo?.url ? (
        <Trigger showArrow
          arrowProps={{
            style: {
              zIndex: 10,
              borderLeft: '1px solid var(--color-neutral-3)',
              borderTop: '1px solid var(--color-neutral-3)',
            },
          }}
          popup={() =>
            <Card style={{ borderRadius: '6px' }}
              bodyStyle={{ padding: '4px', }}
            >
              <ShowImage size={'large'} onEditClick={() => {
                setVisible(true);
              }} />
            </Card>
          } >
          <div style={{ cursor: 'pointer' }}>
            <ShowImage size={size} />
          </div>
        </Trigger  >
      ) : (
        <div className={classNames(styles['upload-picture'], styles['upload-picture-add'], styles[size!])}
          onClick={() => { setVisible(true); }}>
          <div className={styles['placeholder']}>
            <IconPlus className={styles['icon']} />
          </div>
        </div>
      )
      }
    </>
  }

  function UploadImage(props: {}) {
    return <>
      {imgInfo?.url ? (
        <ShowImage size={size} />
      ) : (
        <UploadImageTrigger>
          <div className={classNames(styles['upload-picture'], styles['upload-picture-add'], styles[size!])}>
            {text && <div className={styles['label']}>{text}</div>}
            <div className={styles['placeholder']}>
              <IconPlus className={styles['icon']} />
              <div className={styles['text']}>添加图片</div>
            </div>
          </div>
        </UploadImageTrigger>
      )}
    </>
  }

  return (
    <div>
      {size == 'mini' ? (
        <MiniUploadImage />
      ) : (
        <UploadImage />
      )}
    </div >
  );
}


export default ImageUpload;
