import { MyFormItemOption } from "../pages/product/edit/interface";

declare global {
    interface Window {
        loadProductEditData: any,
        saveProductEditData: any,
        getRemoteOptions: any,
    }
}

export async function loadProductEditData(): Promise<{
    platformId: number,
    platformName: string;
    shopId: number,
    shopName: string;
    fullCategoryName: string;
    schema: any;
    data: any;
}> {
    return await window.loadProductEditData();
}

export async function saveProductEditData(values: any, publish?: boolean) {
    return await window.saveProductEditData(values, publish);
}

export async function getRemoteOptions(shopId?: number, optionAction?: string, forceUpdate?: boolean): Promise<MyFormItemOption[]> {
    return await window.getRemoteOptions(shopId, optionAction, forceUpdate);
}