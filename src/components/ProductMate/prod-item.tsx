import { useCallback, useState } from "react";
import { ProdItemProps } from "./interface";
import { Empty, Image, Select, Space, Spin, Typography } from "@arco-design/web-react";
import { IconEdit } from "@arco-design/web-react/icon";
import styles from './style/index.module.less';
import { debounce } from "lodash";

function ProdItem(props: ProdItemProps) {
    const { id, title, image, imageSize = 64, copyable, editable = false,
        idLable, remoteSearch, searching, placeholder, options, onSearch, onChange } = props;
    const [editing, setEditing] = useState(false);
    const showSearch = editable && (editing || !id);
    const debouncedFetch = useCallback(debounce((value: any, reason: any) => {
        onSearch && onSearch(value, reason);
    }, 500), []);

    const handleChange = (value: any, option: any) => {
        setEditing(false);
        onChange && onChange(value, option);
    };
    const copy = typeof copyable === 'boolean' ? { id: copyable, title: copyable }
        : typeof copyable === 'object' ? copyable : { id: false, title: false };
    return <>
        <Space size={0}>
            {imageSize > 0 &&
                <Image width={imageSize} height={imageSize} src={image} alt=""
                    style={{ marginRight: 10 }} />
            }
            <div className={styles.right}>
                <div>{showSearch
                    ? <Select
                        allowClear
                        showSearch
                        size='small'
                        style={{ width: 280 }}
                        loading={searching}
                        options={options || []}
                        placeholder={placeholder}
                        filterOption={remoteSearch ? false : true}
                        value={!id ? undefined : id}
                        onSearch={debouncedFetch}
                        onChange={handleChange}
                        notFoundContent={
                            searching ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                    <Spin style={{ margin: 12 }} tip="数据加载中..." />
                                </div>
                            ) : <Empty />
                        }
                        triggerProps={{
                            autoAlignPopupMinWidth: true,
                            autoAlignPopupWidth: false,
                        }}
                    />
                    : <Typography.Text
                        copyable={copy.title}
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 0 }}>
                        {title || '--'}
                        {editable && <span className={styles['operation-edit']}>
                            <IconEdit onClick={() => { setEditing(true); }} />
                        </span>}
                    </Typography.Text>
                }</div>
                <Space size={0} className={styles.secondary}>
                    <span>{idLable || 'ID'}：</span>
                    <Typography.Paragraph
                        copyable={!!(copy.id && id)}
                        className={styles.secondary}>
                        {id || '--'}
                    </Typography.Paragraph>
                </Space>
            </div>
        </Space>
    </>
}
export default ProdItem;