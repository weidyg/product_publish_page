import { ProductEditDataProps } from "../pages/product/edit/interface";
import { ImageInfo } from "./ImageSpace/interface";
import { MyFormItemOption } from "./product-edit/interface";

declare global {
    interface Window {
        loadProductEditData: any,
        saveProductEditData: any,
        getRemoteOptions: any,
        getImagePageList: any,
        getImageUploadConfig: any,
    }
}

export async function loadProductEditData(id?: string | number): Promise<ProductEditDataProps> {
    return await window.loadProductEditData(id);
}

export async function saveProductEditData(values: any, publish?: boolean, id?: string | number) {
    return await window.saveProductEditData(id, values, publish);
}

export async function getRemoteOptions(shopId?: number, categoryId?: string, optionAction?: string, forceUpdate?: boolean): Promise<MyFormItemOption[]> {
    return await window.getRemoteOptions(shopId, categoryId, optionAction, forceUpdate);
}

export async function getImagePageList(input: {
    pageNo: number,
    pageSize: number,
    refType: string,
    keyword?: string,
    sortName?: string,
    sortAsc?: boolean,
    folderId?: number
}): Promise<{ items: ImageInfo[], total: number }> {
    const { folderId, refType, sortName, sortAsc, pageNo, pageSize, keyword } = input;
    return await window.getImagePageList(keyword, folderId, refType, sortName, sortAsc, pageNo, pageSize);
}


export function getImageUploadConfig() {
    // const _action = 'http://localhost:60486/api/services/app/ProductPublish/UploadImages';
    // const _convertData = (response: { Success: any; Error: any; Result: any; }) => {
    //     const s = response?.Success;
    //     const e = response?.Error;
    //     const m = response?.Result;

    //     const error = e && {
    //         code: e.Code,
    //         message: e.Message,
    //         details: e.Details,
    //     }

    //     const result = s && m && {
    //         id: m.Id,
    //         name: m.FileName,
    //         pix: '',
    //         size: m.FileSize,
    //         url: m.Url,
    //         folderId: m.FolderId,
    //         time: m.CreationTime,
    //     }
    //     return { error, ...result };
    // };
    const { action, convertData } = window.getImageUploadConfig();
    return { action, convertData };
}   
