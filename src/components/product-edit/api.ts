import { ProductEditDataProps } from "../../pages/product/edit/interface";
import { Category } from "../CategorySelect";
import { MyFormItemOption, PublishProductJobProgress } from "./interface";

declare global {
    interface Window {
        loadProductEditData: any,
        saveProductEditData: any,
        getRemoteOptions: any,
        getCategorys: any,
        getPublishProductJobInfo: any,
        publishProductWithJob: any,
    }
}

export async function loadProductEditData(categoryId?: string, shopId?: string): Promise<ProductEditDataProps> {
    return await window.loadProductEditData(categoryId, shopId);
}

export async function saveProductEditData(values: any, publish?: boolean, id?: string | number) {
    return await window.saveProductEditData(id, values, publish);
}

export async function getRemoteOptions(shopId?: number, categoryId?: string, optionAction?: string, forceUpdate?: boolean): Promise<MyFormItemOption[]> {
    return await window.getRemoteOptions(shopId, categoryId, optionAction, forceUpdate);
}

export async function getCategorys(shopId?: number, parentId?: string | number): Promise<Category[]> {
    return await window.getCategorys(shopId, parentId);
}


export async function getPublishProductJobInfo(jobkey: string): Promise<PublishProductJobProgress> {
    return await window.getPublishProductJobInfo(jobkey);
}

export async function publishProductWithJob(id?: string | number): Promise<string> {
    return await window.publishProductWithJob(id);
}