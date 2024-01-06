import React, { DragEvent, useState, useMemo, useEffect, useRef } from 'react'
import { Button, Space } from '@arco-design/web-react';
import useMergeValue from '@arco-design/web-react/es/_util/hooks/useMergeValue';
import { thumbnail } from '../until';
import { ShowImage } from '../../ImageUpload';
import styles from './images-editor.module.less'
import { IconImage } from '@arco-design/web-react/icon';
import ImageSpaceModal from '../../ImageSpace/modal';
import { ImageInfo } from '../../ImageSpace/interface';

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


    const [visible, setVisible] = useState(false);
    const [imgList, setImgList] = useState(imgs);

    useEffect(() => {
        handleChange(imgList);
    }, [JSON.stringify(imgList)])

    function handleAddImgs(files: ImageInfo[]) {
        if (files.length) {
            const newImageList: string[] = files.map(m => m.url).filter(f => !!f) as string[];
            setImgList([...imgList, ...newImageList]);
        }
    }
    function handleEditImg(index: number, newImgUrl: string) {
        const newImgList = [...imgList];
        newImgList[index] = newImgUrl;
        setImgList(newImgList);
    }
    function handleDelImg(index: number) {
        const newImgList = [...imgList];
        newImgList.splice(index, 1);
        setImgList(newImgList);
    }

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

    function ImageItem(props: any) {
        const { index, url: imgurl } = props;
        const animateWrap = useRef<HTMLSpanElement>(null);
        return <span
            ref={animateWrap}
            key={index}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
        >
            <ShowImage index={index + 1} size={88} url={imgurl}
                style={{ backgroundColor: 'var(--color-bg-1)' }}
                onChange={(file) => {
                    if (file?.url) {
                        handleEditImg(index, file.url);
                    }
                }}
                onDeleteClick={() => {
                    animateWrap?.current?.classList?.add(styles[`down-out`]);
                    setTimeout(() => { handleDelImg(index); }, 200);
                }}
            />
        </span>
    }

    return (<>
        <ImageSpaceModal
            visible={visible}
            onVisibleChange={(v) => { setVisible(v); }}
            multiSelect={true}
            onChange={(files) => {
                // console.log('images-editor',files);
                handleAddImgs(files);
                setVisible(false);
            }}
        />
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
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXoAAABECAYAAACPp/75AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABeqADAAQAAAABAAAARAAAAABXXSZPAAAaI0lEQVR4Ae2dB5hVxdnH7wLSy4KgiKAYBSOWqFgCihQjKKKgsBiDggiCJepn8hmDlRg1lifmQY1R2iKWEKxIs6CugCAi1singIoUURTpbSn7/f6Hc67nnnvO3buFZe/uO88zOzPvvNP+M/POzDtzz8ZiZgwBQ8AQMAQMAUPAEDAEDAFDwBAwBAwBQ8AQMAQMAUPAEDAEDAFDwBAwBAwBQ8AQMAQMAUPAEDAEDAFDwBAwBAwBQ8AQMAQMAUPAEDAEDAFDwBAwBAwBQ8AQqCAIZFWQdlgzDIEKhUBOTk7VlStX7j9nzpzVUQ079dRTW+3cuXPtggULfozi8dM7depUd/v27U1Fy8rK2pAqb386+du2bXti1apV68ifnZ39wWuvvbZZfjOZgUCVzKim1dIQyHwETjrppGuw9w0fPjxy3iGMqyFUB3/11VefI5SnSeBHtXzXrl2jENir4H9FgjiKz6Nv2rTpvPz8/MWuvdOjp+nmUt5M2bVr17ZKM42xlRMEqpWTelg1DIEKjQAC/uaCgoK71cgpU6Ycw2784nnz5m0INnrjxo06ZV+HPUJxCPxrcB6S329OOeWUXyF0O4qGsO9I3qv88UX1s8DUZCH4XYp0jSjDicbtRXtCFxbi3uaE8WWKfCxqHyBggn4fgG5FVi4EEH5ZJ598cgOv1YS7o3J5t127dmfNnTt3pUeXi5DcgRAdDM9cglUQ4nfB93yQb/fu3df60o0mXYkEPYtGPcoc48sz0gvfHVGRVapUuYQ4E/RRAO0jeuQRch/Vx4o1BCocAgjrgvfff/8m3P40brvbwKNQoeQhxA8ONhje9+B1dvEI1Xo7duwY4edhN78/YW/3vX2//fa71x9vfkMgiECRd/SPP/64jmyDGYi7hgwZ4t9VBPO28F5EYNSoUUexq9t/6NChs/diMaFZU/ZdlL26Vq1aY/r37x96KTdy5MgrEVJ9GCfvMU5uDs2okhER4E+iS18EJtPAphHNP0LCHrXJCXl5eZv8cDRq1OjWNWvWXADtUGx9eOp6POy+r4BWy+UfG9ztu/QiOTNnzvyRk0STFIneJq6N4ql/Z+r/3zDexo0bbwyjZxKN8X0x4/uftHMSY3dgWN0Z392gDwWH55iDzyAXD4df4zyfNFeFpUmHRr7t4cvFfkY+F0alge8F4o7GDoRvThSfRy+yoK9Wrdp3DLRBNLD6mDFjHhk0aNAXXmYlcQHqOoDqUYI8PqDBfy5B+oxJOnbs2Bbs8vKocEMG5e+vuOKKkf7KMwj60T+n+WlF8L/FwH02ij83Nzcb4fQH4mtRh/m4UjEkGMpvDeEf2JrYLoRfpG/EW+kNKpZ5CPuzAOINbDZjfpwnwBG0z9Bv9QUSQl5OPvHfQctHdz+BdKJJ0P4amuPnz4nQp3gB4kawoLzuhaNc0jekvKHwHzh//vw7cZWhhP05YWngr+2jHwO/t9DEyaht3ps+fbp3YonTM81DW2tQ54bYulF1h2cIcReAgxbAWM2aNddxeS611W7k4p+Qi8Vd8GqTt+ZPwsKvMvwGHm0AWlO+v1/8LAn+Igt6GvAtQnk8uQxG4A/F1aQvsaHCR1F5TYBiGdLrEqtSmMsvv3w5ffAQTf4rO4/HEaTHIOyvJ+zMfnDsBBCDiwnGDtJFCnqEvNQPtSjrE8ZCkpCn7CwWn9G4NeF5BF7tbiT0T8eaAQGE/QcI1G5g1AWh7Fe7dCVaapm4gUf+c+MEPC7NI53qeVz3RX+YReAewgPoizdxp/niOpFPX+x2eEZQp/WKIzwVJ+VcgudhXz5xL3TN3xlxQgX1jB49uhHzTpvSXeA6Qc0cMGDAGubhy2DQh/uX8yA9I3qUcU/FOrEFTR0RyLcNc/yzYKQXJv4XlKXgaPiSTtUsui8iE271+BMEPRVdTuJmXmSUSyFZKgR7A4VcH8Xn0WGfxY6ukxcuxB3Je10tJGkZAD+TevwlLeYKxMSu+27661OwfYr2X8vAqYmrHVoB+D3KIqwJGzT7QZgIz2Z4tfsIMykv0kg7hLTq+8fCElOnK6F3gG86fa56raePbmGc/JE6/z0sTWWkSQ9Pu2X3qqEfmtJXzbA6PcTLwv8agd7QtWj3wT/GjfyZKc5tHj8CjGctkNWhvcYY/96LA8dc6FJX9oWWUtDDp7uZNl5az4XueHF1Gk6KD+E71KP5XdInjK0EQQ+jLmd1078Rxt3+hH6/Vxk/LcxPPtXgrYNNe/CwEn0zePDgd8LyC6MhSJqnW5+w9JlMY5C9jGA9kza8DgZX4Nd5fxj4fYj74cSJE6v37ds332vjtGnTaixfvlxCOh+h+5JHV/+gDmpdmBoOYX06vEeTbhMqvKe89J4rlRK7mfvgWV+jRo0rRGdSaBE+h7FwH331IbsM7SzNhCAARqdwsRr6QIKT1PMkOU7JmCOXgv+7IVkI79UBuu4CtENcG6BrsX8VWi+sFn1H0FevXr1VgM8JoqabAv+RCpBXT+q5MIRvZQitwpHAQadamWdRZUogO4YN1ttbt279jkDb8ePH12GztcuNitF/u5hzOi07hnkwCJWdM0c8mtzFixdr4/oK3g9bt259ij/O71+0aJEE+Qn0xdmtWrV6wx8nP3c6u5EPcXJQ0DsRdGLbgQMHLo5zFdPDxO5CpZMqUdTsOCqdzQDuSl4z/QKqqPlURH46cz4CuBtte4JOz1UbCTfA/wo/bNlJsINoqQwC+jgE9EcsFOPJb0AKXqnqZJ4J00GSx2P0UT3KHsRR1pn0GtzkfylxC+jD/zAx2pfG2NpTjfL9l7fybWm3FrowswV1iXZ+cYOu/Kt4IOBB1bMNbB0q7gouYJcEWEKD8DqCHnct/ZLAQ/hF6L2wHVHf5BDehEBP4PEC8NTw/LiHwBfG2Ip6xrikf3/WrFk/+PjLvZexL+HqCG3a2tStcEfoefJDy2UsP0H4ePzt3PhRCPBRrj/uEB9D4Cfo2IU1DBd6TIS1kZZNMOTvLQ4Fy5Yta7Bt27atlLslgYkAc3zPYEB91LlzZ83zlCZ095AyxT6IZGFsD3g3AE6nfVB8uS+SgTCvYcOGRyOkF6myhNeDly6TTmexPaywBiCMuogHfHUSCDUI6zbEe4JJu8u44eRQlQE6kjK7Q3yFeoyNR+LhTmEhaYfhbczEmAmrTgUV3rCwNaGR54ZZ8Di7jABQHcJ29LpAnEw9JCS0Akyk//QaKNQS3xLrGHgejuITHeG059bYS5ABLvXugO0oS3Wdkwv+Jh6NU1RL/FJZP+o2ZzfY/eS30J17DmjS3Qfj0rqc1YmXU1Ut5nM7LncnkudG5ktvt8y4Q7zqmc1uPi9OTOEJ3dGn4LeocooAKhpvJ+DUkIH2AoNyGLYfhLtSVRtenbx07A89fUmQr1u3bhw80ktKaMRfVhBXi7h/E9eTqPWcBn8+L/oKRZ00gkXnNPj6YN/G341BvcDHYt5SRoBd+n5kebibbdJpYfbs2WvhuZX+3ESf6OK80hoE+Rlg4G18e+C/HTDeABttUKQuW4nAHYTX2c1D/4INTRvFeYYxfRxz6GPSfsJm60SPHua+9dZb1ZYuXZr0qmfcuHEOO6dxLTbagG1BDfquXrs5Ee6fzZs3x1gQYsqDOH+U4z/wwAO3du/ePT5Pg4JeFwjZ7KB/ydFAK0aJDI0WQDfgOsf4EmVmiXVcO4gBdnIQCnSDPwRfwMD3PANOgzQHGynopcdHUKuvVzNw/8sADWYfW79+/U3klVTu008/3ZC0k4k7jUQ/UmZ3vQhKygACcbAVXMRkuZfgjYyJWfh/H9z9h6XNVBptnMv4P8Vff2jSrUYaVB+fgpOjQvAzQWvhhfE/hYDe6oU9F4zv1Ft9X/hIeCXsNQ8XUnYrL85zUR85396ZOnVqynp5/Om4lOOcLNPhLS88/k0H49I5cYLnWsbnfNWRudeYsO6fSqXKS5YsOQOcQjdWgQJqc0JaEaAVGuQu7laY7vYYEwQ9jbpRETT0AZz/9ZiK6wLMdADsXtz0li4RASZrOwZHgtpEHKhe9IKim59bA5d+/IaBeRzvepuxEHzrj/f8COrz4KlH+N/0V9Io5n7kGMq8w+WXTtHZ9bB7ac6u4hXSalIs43Kwa6rLXOpQjwsqnQhuwUoQPEraMUygzhxDr+JEkqDTJD7jjftk0REUXmMQ0J43ytUOPOmNeoD54EDYCYJnwq6P/jwamuIK2LxJfZYk6BXJR9bUr049+VRDX/o7QS6IJx1Tu3bt1zNNN59Ou1ye+8GyERh+hHt8EdKFsjKXN4DzvLBIymhBGc2Ik27+0zCewmjknzDfozp0BoVtS5FZRyrSgfi58KValTJuZU/R5vIQ9Q14j/NVpDH9kOpHZvr13A1McumDx/rS+b2XKYCgHifXb3S85BWAo7Kh3AmUdQzxsrqc0o97JOQXouvtqstXhPaXhFtiG+meADduWIzGYS/k9HEOapzRLBRfMdCfg+ESjqmq21tx5krsAVMJXdmg8dQKokt6OxLcz0QfJdDIqzq0DfCsYae/RRelhRnSjIOnsIUmNJstW7ZIJvwQGpnhRHCUOmc57lW4c7F12ASd6W8W4/kXCsNTLxjHuH+HRwhxmcqm6H1Yf+1PL782UOTjLLrkc21pnXhDBT2Zv0qZsqGGCX0nEXorrffxt4UyGbHUEXCPlwO9jNmxS53SwwsHXQajI+hxuxKXJOjpR/0Krx1xi4OqH+WFkJc+XVtQqRMG4b4rums0Bu5kAPdAyP/k0iSMZAs1tOVNdvk6ofTGb0LeRYxTQN0w8BDS8+gDRw3EvNMPrfLC+Pw0qXE4QUzg3uQIP938RUMA9WZdTr6zSfUgfeCN9UPYQM0IywmeI4JxhA+Fd1kYv0fTfRebnkmEm9LHz0nIk1cW87y+x1OYW6dOnYJLLrlEi3uCCRX0CRzlIyDVgkzCLnEPyf5GIcBAmcMO4SwGy5wwHnbdW3hbf/CKFSs0CJMM6bSz0PvrC8TLwhDnIe8Z7Pjz0nnaFU8U8LiqnnsCZAuWIgIsHDvI7v+KkeW3nPKCv7pNyoZT2sMQ9Ra/IppGjPm7Eb5XoQoZzJifzebkSNqstkoWTQ40uiHhc7GaM1P9cZx6N/vDYX7KyYV+IkJ+BQJ7iHgo7xCcpfKnY1CnSsg3CPJmhKCn4bpU0pFoYbABFk5EQLsPOruxqLrBZze3BO8BuplftWpVDZe7CuGW8n///ffiyffCorHLXoMQ3ohw/1JHUFQtUskkmZII+aTMjFDeECjgPXyh9yZ8g0cLSYUxuktCkLdRg5A5XXC6IHf0G4blorEzL5AL7VsE/6Xye4ZNlV7dSNAvZe4kxHk8US679tsp4yLid+P279evnxYLlafvHaW8KId/P1hPED/m7T1O4t+MEPRU+ZeqNiCaoE/sv6QQu4LfQhyVFJFIaMB79q8TST+HGFhXEXpMFPdXtj9HpvCRrjqDLsblan4KNovKDAQORog7wiYzqlv8WiKgD2TcXorV/wk4nZwkOCXM1+E8xG78n3yldbVopW3cV28jKPtKN+/vWSTe8srBvwp/5MmKE4eecUotu5P63ooa9H7SeMnjbqSgZ4UZCVejOGeip40mNKYXbHolkGSIX0yBw5Iiikhgp1kToXQojdjVvHlzu9wtHL8fYfkgjA0Mq9AvxwtL3I/DeEQjXnkU2ZDn/iTayguarUVOXMkToIMfAwQSMlFGR3jPjIc/EmPUDH3fe++9yP71MjF3DwLgpU93PODiIYH5NWP5MMIz2LXf4ceJO6ksV3XjJxfLj5A+CN3/c5TVvqgZSC7y4+S/kO6PpF9JnTtS1znY0KwiBT2Jdcl3UGgqlwhPa7yySYaCUx43khJEEGiMBr8u+Bb5fwAQwV7pySyuLwGCbJJxv3WjY+gG+HTJWmrGPfJKNeQccUst4wqeEc8Zr+ekqk8RNKepoXMpCAG8LYI0f5i5V6xXM/488K9GqPUJ0JKC1P026nNWUkQGEerVq/chJ+H/UOXptHkybToff25YEzzVDW1uiqB+xM8DTRsdmRbBuLp1697mqWPEwAZZv/aXkJeMXc9iM5RyJyguHYNcvIy0f6Kv55N3N3/eYekjBT0Z9KTw6mGJqJD+1dll8DwNz7/CeIjfGEYvBu12pSG/F4qR1pKUEQJMAG9TUKzTQBlVs1wVw668D3PpQebRWsZ3uaobldnBu/hPC6sU6h2pNzLauL8ql8rTMXuUGV4o0tXF6zX+WF8f6o4sIY7/x3s/NEcVJnUNC4uEun4A+QkytDcLzAo0F/HstCnjkcRxcUKyp6VIlLmSO7kjgnWGrju2z71kkYKeI8B8jynoslp1c2kr0eG+Iz+Vr8ovKK9l4J7DT3N7+t+MBtOHhfmZ710ciR7jYlA6KcdQ+d9QYT3j/An6fSKiTzuK/Ffr+88KN2jQ4MUNGzbsD0+FuhRS24pjwKcTerq84qQtSRr6qZ3S0w+FCoeSlFOB0upp61O0R+q0zrg92FlWjWofgmIWfCe58d3gnRnFy2uo7fRDVHS69Eqjo08XkACfTq66y/IbqXsexn6Fvc4fwb3VD16YhSWfedqf/hyQnZ19tVSdUsV48XL5ZatOeOloRfRRul7+tK5/Nm4Hjx4p6D2GdN2cnJzdVP4M+LtyrBiL+7t004rP/drhSi8NC4felP5NYRpyDwvHOmh6zzqVnwQ3YbF5iFXw74D0EyyyldqAkf7hx0MstL0BollZg4Fg6UQdVOzbZV12hpUnkPQ9CAl12R1gN4U379qoRG5W2P3vJt4x8OfzidttXjjoloKQD2Zp4QACYLyJzXDCE0rmn17diHM9u+mEuEDymLsZywvSvTCb2c3s8Cd74RC3JbRjsXqbn3QfQ/0SHq6UmqAn4wL0tAPYlesp5MUI4vk09h9UosiGtA0Q8i+TUDuYZS1atHB0YXz6Uzrg6ZQl1dHNgHotu/4RvDl9sDAdVZErkUEJwKMaOEinOAC7ht1BthbGsmoC/aVXCl1VHv1igj4C+Pbt2x/KFwn9W+3tHNtz+DxxqgkdkdteJ1caHf1eR7IYBTB/vyPZ+VFJmXM6TTzK3H+VBWdIFJ9HLzVBrwz19prP2eYg7Bcw4f9GZWYg7D/1CkvHJY2OIRLsB9OI75kI53qXsK665hoE2QOsdrfDo+PPreiormY1vZ5V8ql0yqgoPOBTlfarOZ2xBLM+40cu55elkFfhlHsZ9WiGu4Ax96VoZpIRQMjf4lHBahtjuxevY171aOXJpX7bqduswurEL28L/SFQYXlY/N5HoFQFvaqrb48jrPXpU336Nq2LOfiqIKh7klxPhU5zm/0BevnfIrQWu+G4A20pgcvZxd5LOQ+Q5nzsk4QvQp0zlAXn2zhzBfbQ5n5qHq52iZNpez/w31iWTXafeQ1z63FXWZadgWV94dZ5M0L+fATpmxnYhhjCXfO7AFuTU7VzkqMdBWwylmZie4J1Zj7VD9KCYXgOkPzx06E1ccMHB+Og6z8+3eznL0t/XNCjdmnGTjzygidQKe99/RCEeu9AnILON2lxZxHvRetn9Am7e4R7BwZKH9wLAUmXDzIbGED38kH9Bwr75SXALYK/J+kHkl4/OuhBGxYC8h+IG+vkVoH/0F6vH+6lvbeAm6MgLKsmU76+wzGe8g7DfkwdJtHHZVV8xpXDL03Hcr90I7j1QcjPzrgGuBVmnP1KbcD6mzB73rx5K/yETPIjQ/4HWXQgC/Au3P6qO+37KEUb9if+poj4A4JxYLYL3mILejZUTdFiZPPjrY28cKvCPaizwFJOWiequKBHQMp/eETFQ8kUkk2EbKGG1V769QRDekmFfrii61JBTzX/hcBYL0K6BpVNLh2VB/8T5KWb5t9gK7ygZ1A+yKCcinB9Zl8IWD6PcAE452D1b+r6YhNmPnQzPgT0jz46dOhwbKZ/ypd+fo151sdtmubqFMbiCF9TM85Le1pR6auZT17dV9OmZ7xAiLuK+OEh9FAS+ZdobiDYTyBj/feuhPw5xU9JIEQE4oIeQbGMZ1m6VNsrJmx3jvC/gQVmFZV9AZXDuyURFAj7r8GyEzvM63Gf3CuNKGeZ0uYFVEk2LcOTLf37M92fbEgrQYCJtO+QdiXWeeVE+S+A95+hz8ev01WkYVJMYhJ9De/XkUyVIKK4Qh78hoFfQ0HEyeCz4kDFPJtKuqOVlnkX+nkDyjmTcnCqbI8qg8cPudw3PK94dpkb3Q+nRbFnBB1sHgKTd1RZ/CtQ/85mrMalvtcI4jaxo55EeDljfqRHL6nLf4Qq4N38EvIJ/dQCXwV4k/gZzL2qKou66V8VvlS/fv08hc0YAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoaAIWAIGAKGgCFgCBgChoAhYAgYAoZAKSGQVUr5WDaGgCFQBAQKhseqxT6PHRsriDUpQrLyxLo8NiH2eVYWLTBT7hEwQV/uu8gqWNEQKMiJHUmbJmHlZrKZReV7ZT0b+ymTG1EZ6l6lMjTS2mgIlCsEsmJjqE+mC3lB2iGWFbu3XGFrlQlFwAR9KCxGNAT2DgIFQ2K1ybnd3sl9H+RaEDtzH5RqRRYRARP0RQTM2A2BEiHQLJZPetmKYjZVlIZU5HaYoK/IvWttK3cIZA2P7eT6ckK5q1hxK5QVe7K4SS1d2SFQreyKspIMAUPAReBa3K3ot3MQ+o0zEpWs2HLqPSrWJvZgRta/klX6/wEzJJ4XG08MoAAAAABJRU5ErkJggg==" />
                    </div>
                    <div style={{
                        height: '612px',
                        overflow: 'auto',
                        border: 'none'
                    }}>
                        {imgList.map((m, i) => {
                            return <img key={i} style={{ maxWidth: '360px' }} src={thumbnail(m, 360)} />
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
                        type='primary'
                        onClick={() => { setVisible(true); }}>
                        添加图片
                    </Button>
                </div>
                <div className={styles[`sidePadding`]}>
                    <Space wrap size={6} >
                        {imgList.map((imgurl, index) => (
                            <ImageItem index={index} key={index} url={imgurl} />
                        ))}
                    </Space>
                </div>
            </div>
        </div>
    </>
    )
}

export default ImagesEditor;