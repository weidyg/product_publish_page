import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Message, Popconfirm, Popover, Progress, Space, Upload } from '@arco-design/web-react';
import { IconDelete, IconEdit, IconPlus } from '@arco-design/web-react/icon';
import useMergeProps from '@arco-design/web-react/es/_util/hooks/useMergeProps';
import { ImageUploadProps, ImageUploadSize } from './interface';
import styles from './style/index.module.less';
import { UploadItem } from '@arco-design/web-react/es/Upload';

const defaultProps: ImageUploadProps = {
  size: 'default',
  text: '图片',
  value: ''
};

function ImageUpload(baseProps: ImageUploadProps) {
  const props = useMergeProps<ImageUploadProps>(baseProps, defaultProps, {});
  const { size, text, value, onChange, ...rest } = props;

  const defaultFile: UploadItem | undefined = useMemo(() => {
    return value ? { uid: `${new Date().getTime()}`, url: value } : undefined;
  }, [value]);

  const [imgFile, setImgFile] = useState<UploadItem | undefined>(defaultFile);

  useEffect(() => {
    onChange && onChange(imgFile?.url);
  }, [imgFile?.url])

  const handleChange = (_fileList: UploadItem[], file: UploadItem) => {
    let newFile = { ...file || {} };
    if (file.originFile && file.percent == 100) {
      Message.warning('暂不支持图片上传！'); return undefined;
      // newFile.url = URL.createObjectURL(file?.originFile as any);
    }
    if (file?.url != newFile?.url) {
      setImgFile(newFile);
    }
  }
  const handleProgress = (file: UploadItem) => {
    // setImgFile(file);
  }
  const handleDelete = () => {
    setImgFile(undefined);
  }


  function UploadImage(props: { children?: ReactNode }) {
    const { children } = props;
    return <>
      <Upload
        action='/'
        fileList={imgFile ? [imgFile] : []}
        onChange={handleChange}
        onProgress={handleProgress}
        showUploadList={false}
      >
        {children}
      </Upload>
    </>
  }

  function ShowImage(props: { size?: ImageUploadSize }) {
    const { size = 'default' } = props;
    return <>
      <div className={`${styles['upload-picture']} ${styles[size]}`}>
        <img className={styles['upload-picture-image']} src={imgFile?.url} />
        {size != 'mini' &&
          <div className={styles['upload-picture-mask']}>
            <Space size={'medium'}>
              <UploadImage>
                <IconEdit />
              </UploadImage>
              <Popconfirm
                focusLock
                title='警告'
                content='目前暂不支持图片上传，删除后无法再次添加图片，是否继续删除?'
                onOk={handleDelete}
              >
                <IconDelete />
              </Popconfirm>
            </Space>
          </div>
        }
      </div>
    </>
  }

  return (
    <div>  {
      imgFile?.url ? (
        size == 'mini' ? (
          <Popover content={<ShowImage size={'large'} />} >
            <div><ShowImage size={size} /></div>
          </Popover>
        ) : (
          <ShowImage size={size} />
        )
      ) : (
        <UploadImage>
          <div className={`${styles['upload-picture']} ${styles[size!]}`}>
            {(imgFile?.status === 'uploading' && (imgFile.percent || 100) < 100) ? (
              <Progress
                size={size}
                type='circle'
                percent={imgFile?.percent || 100}
                className={styles['upload-picture-progress']}
              />
            ) : (
              <div title={text}
                className={styles['upload-picture-text']}>
                <IconPlus />
                <div>{text}</div>
              </div>
            )}
          </div>
        </UploadImage>
      )
    }
    </div>
  );
}


export default ImageUpload;
