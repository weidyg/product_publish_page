import styles from './style/index.module.less';
import { Category, CategoryItemProps, CategoryListProps } from "./interface";
import classNames from '@arco-design/web-react/es/_util/classNames';
import { Empty, Input, Space } from '@arco-design/web-react';
import { IconLoading, IconRight, IconSearch } from '@arco-design/web-react/icon';
import { memo, useMemo, useState } from 'react';
import { groupShowData } from './until';

function CateItem(props: CategoryItemProps) {
    const { id, name, hasChild, loading, active, onClick } = props;
    function handleClick() {
        onClick && onClick(id);
    }
    return <li onClick={handleClick}
        className={classNames({ [styles['active']]: active })}>
        <Space size={0} align={'center'} className={styles['item']}>
            <span className={classNames(styles['label'], { [styles['hasChild']]: hasChild })}>{name}</span>
            <span>{hasChild && (loading ? <IconLoading /> : <IconRight />)}</span>
        </Space>
    </li>
}

function CateList(props: CategoryListProps) {
    const { loading, prefixCls, level = -1, data = [], value, onItemClick } = props;
    const [seachValue, setSeachValue] = useState<string>();
    async function handleItemClick(cate: Category): Promise<void> {
        onItemClick && await onItemClick(cate);
    }

    function handleSeach(seachValue: string): void {
        setSeachValue(seachValue);
    }

    const groupData = useMemo(() => {
        const _data = seachValue ? data.filter(f => f.name?.indexOf(seachValue) > -1) : data;
        return groupShowData(_data);
    }, [JSON.stringify(data), seachValue]);

    return <>
        <Input allowClear
            onChange={(value) => handleSeach(value)}
            placeholder="输入分类名搜索"
            className={styles[`${prefixCls}-seach`]}
            suffix={<IconSearch />}
        />
        <div className={styles[`${prefixCls}-list`]}>
            {(level == 1 && data?.length == 0 && !loading)
                ? <div className={styles[`${prefixCls}-list-empty`]}><Empty /></div>
                : <ul>
                    {groupData?.map((item, index) => {
                        const { groupName, cates } = item;
                        return <span key={index}>
                            {groupName && <div className={styles['gname']}>{groupName}</div >}
                            {cates?.map((cate, i) => {
                                const _active = cate.id == value?.id;
                                const _loading = _active && loading;
                                return <>
                                    <CateItem key={i} {...cate}
                                        loading={_loading}
                                        active={_active}
                                        onClick={(id) => {
                                            handleItemClick(cate);
                                        }}
                                    />
                                </>
                            })}
                        </span>
                    })}
                </ul >}
        </div>
    </>
}

export default memo(CateList);
