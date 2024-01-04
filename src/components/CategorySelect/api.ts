import { Category, CategoryTree } from "./interface";

declare global {
    interface Window {
        getCategoryTree: (platformId: number) => Promise<CategoryTree[]>,
        getCategorys: (shopId: number, parentId?: string | number) => Promise<Category[]>
    }
}

export async function getCategoryTree(platformId: number): Promise<CategoryTree[]> {
    return await window.getCategoryTree(platformId);
    // return new Promise((resolve, reject) => {
    //     setTimeout(async () => {
    //         try {
    //             const data = await window.getCategoryTree(platformId);
    //             resolve(data);
    //         } catch (error) {
    //             reject(error)
    //         }
    //     }, 1000);
    // })
}

export async function getCategorys(shopId: number, parentId?: string | number): Promise<Category[]> {
    return await window.getCategorys(shopId, parentId);
}