import React, { useState, useEffect, useMemo } from 'react'
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import { thumbnail } from '../until';
import { ShowImage } from '../../ImageUpload';
import { Space } from '@arco-design/web-react';


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

    return (
        <div style={{
            backgroundColor: '#f7f8fa',
            borderRadius: '12px',
            padding:'12px',
            display: 'flex',
            justifyContent: 'space-between'
        }}>
            <div style={{
                width: '390px',
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
                    width: '390px',
                    height: '573px',
                    overflow: 'auto',
                    border: 'none'
                }}>
                    {imgs.map((m, i) => {
                        return <img key={i}
                            style={{ maxWidth: '360px' }}
                            src={thumbnail(m, 360)}
                        />
                    })}
                </div>
            </div>
            <div style={{
                width: '390px',
                height: '672px',
                borderRadius: '18px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '390px',
                    height: '573px',
                    overflow: 'auto',
                    border: 'none',
                    padding:'8px 0'
                }}>
                    <Space wrap>
                        {imgs.map((imgurl, i) => {
                            return <ShowImage key={i} url={imgurl} />

                            // return <img key={i}
                            //     style={{ maxWidth: '90px' }}
                            //     src={thumbnail(m, 90, 90)}
                            // />
                        })}
                    </Space>
                </div>
            </div>
        </div >
    )
}

export default ImagesEditor;