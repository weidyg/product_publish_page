import { useState } from "react";
import { Modal } from "@arco-design/web-react";
import styles from './style/index.module.less';
import ImageSpace from ".";
import { ImageInfo } from "./interface";
import useMergeValue from "@arco-design/web-react/es/_util/hooks/useMergeValue";

function ImageSpaceModal(props: {
    defaultVisible?: boolean;
    visible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    multiSelect?: boolean,
    onChange?: (item: ImageInfo[]) => void,
}) {
    const { multiSelect, onChange } = props;
    const [visible, setVisible] = useMergeValue<boolean | undefined>(false, {
        defaultValue: 'defaultVisible' in props ? props.defaultVisible : undefined,
        value: 'visible' in props ? props.visible : undefined,
    });

    function handleChangeVisible(visible: boolean) {
        if ('onVisibleChange' in props) {
            props.onVisibleChange && props.onVisibleChange(visible);
        } else {
            setVisible(visible);
        }
    }

    function handleChange(files: ImageInfo[]) {
        handleChangeVisible(false);
        onChange && onChange(files);
    }

    return (
        <Modal maskClosable={false}
            title={<div style={{ textAlign: 'left' }}>上传图片</div>}
            visible={visible}
            onCancel={() => { handleChangeVisible(false); }}
            footer={null}
            className={styles['image-space-modal']}
            style={{ width: '800px', height: '500px', padding: '0' }}
        >
            <ImageSpace
                pageSize={20}
                multiSelect={multiSelect}
                onChange={handleChange}
                style={{ width: '750px', height: '450px', padding: '10px 0 0 0' }}
            />
        </Modal>
    );
}
export default ImageSpaceModal;