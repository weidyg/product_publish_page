import React, { DragEvent, useState, useMemo } from 'react'
import { Space } from '@arco-design/web-react';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import { thumbnail } from '../until';
import { ShowImage } from '../../ImageUpload';

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



    return (
        <div style={{
            width: '802px',
            padding: '12px',
            display: 'flex',
            borderRadius: '12px',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-fill-2)',
        }}>
            <div style={{
                width: '380px',
                height: '672px',
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '390px',
                    boxSizing: 'border-box'
                }}>
                    <img style={{ width: '210px', height: '38px' }}
                        src="//img.alicdn.com/imgextra/i1/O1CN01bV5l3h23Wxh6jS4yK_!!6000000007264-2-tps-378-68.png"
                    />
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
            <div style={{
                width: '388px',
                height: '672px',
                borderRadius: '18px',
                textAlign: 'center',
                paddingLeft: '6px',
            }}>
                <div style={{
                    height: '612px',
                    overflow: 'auto',
                    border: 'none',
                    padding: '8px 0'
                }}>
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