import { ReactNode } from "react";

export interface CategoryTree {
    label: string,
    value: string,
    children: CategoryTree[]
}


export interface RemoteCategory extends Omit<Category, 'parentId'> {
    groupName?: string,
};

export interface CategorySelectProps {
    title?: ReactNode,
    submiting?: boolean,
    onSubmit?: (categorys: Category[]) => any,
    data?: CategoryTree[],
    onGetChildrens?: (parentId?: string | number) => Promise<RemoteCategory[]>,
}

export interface Category {
    id: string | number,
    name: string,
    parentId?: string | number,
    hasChild?: boolean,
};
export interface CategoryGroup {
    groupName: string,
    cates: Category[],
};
export interface CategoryItemProps extends Category {
    loading?: boolean,
    active?: boolean,
    onClick: (id: string | number) => any,
}
export interface CategoryListProps {
    level?: number
    data?: CategoryGroup[],
    value?: Category
    onItemClick?: (value: Category) => Promise<void>,
}

export type CateShowData = {
    level: number,
    currCate?: Category,
    data?: Category[],
    showData?: CategoryGroup[],
};
