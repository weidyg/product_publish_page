import { CatePageConfig, Category, CategoryTree } from "./interface";

declare global {
    interface Window {
        getCategoryTree: (platformId: number) => Promise<CategoryTree[]>,
        getCategorys: (shopId?: number, parentId?: string | number) => Promise<Category[]>,
        setCategorys: (categorys: Category[]) => Promise<void>,
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

export async function getCategorys(shopId?: number, parentId?: string | number): Promise<Category[]> {
    return await window.getCategorys(shopId, parentId);
}




export async function setCategorys(categorys: Category[]): Promise<void> {
    return await window.setCategorys(categorys);
}

// export async function getCategorySelectPageConfig(): Promise<CatePageConfig> {
//     return await window.getCategorySelectPageConfig();
// }
