import { ImageInfo } from "./interface";
import { AbpResponse, ImageInfoResponse } from "./request";

declare global {
    interface Window {
        getImagePageList: any,
        getImageUploadConfig: any,
        saveProductEditData: any,
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
export async function saveProductEditData(input: {
    folderId: string,
    imgPix: string,
    contentType: string,
    fileSize: string,
    fileName: string,
    filePath: string,
    thumbnail: string
}): Promise<ImageInfo> {
    const { folderId, imgPix, contentType, fileSize, fileName, filePath, thumbnail } = input;
    return await window.saveProductEditData(folderId, imgPix, contentType, fileSize, fileName, filePath, thumbnail);
}
export function getImageUploadConfig(): {
    action: string,
    convertRequest: (request: Object) => any,
    convertResponse: (response: Object) => AbpResponse,
    saveUploadFileInfo: (request: Object, response: Object) => Promise<ImageInfoResponse>,
} {
    const { action, convertRequest, convertResponse, saveUploadFileInfo } = window.getImageUploadConfig();
    return { action, convertRequest, convertResponse, saveUploadFileInfo };
}   
