import { SelectProps } from "@arco-design/web-react/es/Select/interface";

export interface ProductMateProps {
}
export interface ProductInfo extends SpuProps {
    skus: SkuProps[],
}
export interface SpuProps extends OnlineSpuProps, SysSpuProps {
    id?: string | number,
}
export interface SkuProps extends OnlineSkuProps, SysSkuProps {
    id?: string | number,
}
export interface OnlineSkuProps {
    skuId?: string | number,
    skuName?: string,
}

export interface SysSkuProps {
    sysSpuId?: string | number,
    sysSkuId?: string | number,
    sysSkuName?: string,
}

export interface OnlineSpuProps {
    spuId: string | number,
    title: string,
    image: string,
}
export interface SysSpuProps {
    sysSpuId?: string | number,
    sysTitle?: string,
    sysImage?: string,
}

export interface ProdItemProps extends SearchProps {
    id?: string | number,
    title?: string,
    image?: string,
    copyable?: boolean | {
        id?: boolean,
        title?: boolean,
    };
    imageSize?: number,
    editable?: boolean,
    idLable?: string,
}

export interface SearchProps {
    remoteSearch?: boolean,
    searching?: boolean,
    placeholder?: string,
    options?: SelectProps['options'],
    onChange?: SelectProps['onChange'];
    onSearch?: SelectProps['onSearch'];
}

export interface SaveSpuInfoProps {
    id?: string | number,
    spuId?: string | number,
    sysSpuId?: string | number,
    skus?: {
        id?: string | number,
        skuId?: string | number,
        sysSkuId?: string | number,
    }[],
}

export interface ErrorProps {
    code?: string | number,
    message?: string,
    details?: string,
}
