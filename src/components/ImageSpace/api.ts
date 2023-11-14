import { ImageInfo } from "./interface";

declare global {
    interface Window {
        getImagePageList: any,
        getImageUploadConfig: any,
    }
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
    const { action, convertRequest, convertResponse } = window.getImageUploadConfig();
    return { action,convertRequest,  convertResponse };
}   
