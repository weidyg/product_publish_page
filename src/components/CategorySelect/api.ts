import { CategoryTree } from "./interface";

declare global {
    interface Window {
        getCategoryTree: (platformId: number) => Promise<CategoryTree[]>
    }
}

export async function getCategoryTree(platformId: number): Promise<CategoryTree[]> {
    return  await window.getCategoryTree(platformId);
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

