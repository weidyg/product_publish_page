import { ReactNode } from "react";

export interface CategoryTree {
    id: string | number,
    name: string,
    groupName?: string,
    children: CategoryTree[]
}

export interface CategorySelectProps {
    title?: ReactNode,
    data?: CategoryTree[],
    onSubmit?: (categorys: Category[]) => any,
    onGetChildrens?: (parentId?: string | number) => Promise<Category[] | undefined>,
}

export interface Category {
    id: string | number,
    name: string,
    hasChild: boolean,
    parentId?: string | number,
    groupName?: string,
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
