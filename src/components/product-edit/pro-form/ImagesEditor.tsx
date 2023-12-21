import React, { DragEvent, useState, useMemo } from 'react'
import { Button, Space, Typography } from '@arco-design/web-react';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import { thumbnail } from '../until';
import { ShowImage } from '../../ImageUpload';
import styles from './images-editor.module.less'
import { IconImage } from '@arco-design/web-react/icon';

function ImagesEditor(props: any) {
    const [value, setValue] = useMergeValue<string | string[]>([], {
        defaultValue: 'defaultValue' in props ? props.defaultValue : undefined,
        value: 'value' in props ? props.value : undefined,
    });

    const handleChange = (newValue: any) => {
        if (!('value' in props)) { setValue(value); }
        props.onChange && props.onChange(newValue);
    };

    function getImgSrc(htmlstr: string) {
        let tem;
        let arr = [];
        let reg = /<img.+?src=('|")?([^'"]+)('|")?(?:\s+|>)/gim;
        while (tem = reg.exec(htmlstr)) { arr.push(tem[2]); }
        return arr;
    }
    const imgs = useMemo(() => {
        if (Array.isArray(value)) { return value; }
        if (value?.startsWith('http')) { return [value]; }
        return getImgSrc(value);
    }, [value])


    const [imgList, setImgList] = useState(imgs);

    const handleDragStart = (e: DragEvent<HTMLSpanElement>, index: number) => {
        e.dataTransfer.setData("index", `${index}`);
    };
    const handleDragOver = (e: DragEvent<HTMLSpanElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleDrop = (e: DragEvent<HTMLSpanElement>, index: number) => {
        const droppedIndex = e.dataTransfer.getData("index") as any;
        if (droppedIndex !== undefined) {
            const newImageList = [...imgList];
            const imageToMove = newImageList.splice(droppedIndex, 1)[0];
            newImageList.splice(index, 0, imageToMove);
            setImgList(newImageList);
        }
    };

    const prefixCls = 'images-editor';

    return (
        <div className={styles[`${prefixCls}`]}>
            <div className={styles[`${prefixCls}-container`]}>
                <div className={styles[`header`]}>
                    <div className={styles[`leftWrapper`]}>
                        <div className={styles[`title`]}>
                            预览
                        </div>
                        <div className={styles[`description`]}>
                            当前为示意，真实效果发布后查看
                        </div>
                    </div>
                </div>
                <div className={styles[`content`]}>
                    <div className={styles[`banner`]}>
                        <img src="//img.alicdn.com/imgextra/i1/O1CN01bV5l3h23Wxh6jS4yK_!!6000000007264-2-tps-378-68.png" />
                    </div>
                    <div style={{
                        height: '612px',
                        overflow: 'auto',
                        border: 'none'
                    }}>
                        {imgList.map((m, i) => {
                            return <img key={i}
                                style={{ maxWidth: '360px' }}
                                src={thumbnail(m, 360)}
                            />
                        })}
                    </div>
                </div>
            </div>
            <div className={styles[`${prefixCls}-editPanel`]}>
                <div className={styles[`editHeader`]}>
                    <div className={styles[`leftWrapper`]}>
                        <div className={styles[`title`]}>
                            操作
                        </div>
                        <div className={styles[`description`]}>
                            拖动图片可以调整顺序。
                        </div>
                    </div>
                    <Button icon={<IconImage />}
                        shape='round'
                        type='primary'>
                        添加图片
                    </Button>
                </div>
                <div className={styles[`sidePadding`]}>
                    <Space wrap size={6} >
                        {imgList.map((imgurl, index) => (
                            <span
                                key={index}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <ShowImage index={index + 1} size={88} url={imgurl}
                                    style={{ backgroundColor: 'var(--color-bg-1)' }}
                                />
                            </span>
                        ))}
                    </Space>
                </div>
            </div>
        </div>
    )
}

export default ImagesEditor;