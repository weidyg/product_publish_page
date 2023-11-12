import { ErrorProps, ProductInfo, SaveSpuInfoProps, SkuProps, SpuProps, SysSkuProps, SysSpuProps } from "./interface";

declare global {
    interface Window {
        loadProductInfo: any,
        sysSpuSearch: any,
        getSysSkus: any,
        saveSpuInfo: any,
    }
}


export function loadProductInfo(): Promise<ProductInfo> {
    return window.loadProductInfo();
    // return new Promise((resolve, reject) => {
    //     try {
    //         const _spu: SpuProps = {
    //             id: "7264419452345663804",
    //             spuId: "7264419452345663804",
    //             title: "3338838秋冬重磅320克华棉卫衣圆领落肩袖套头潮牌长袖宽松型休闲",
    //             image: "https://p3-aio.ecombdimg.com/obj/ecom-shop-material/FRkEbVqO_m_11f2715db9f7dd153c8da9bd854b3a64_sx_351174_www800-800",
    //             sysSpuId: '191784',
    //             sysTitle: 'TRY先生-761 新拍韩版修身假两件加绒连帽套头卫衣',
    //             sysImage: 'https://pics.17qcc.com/2018/product/201808/16/6501999856907.jpg',
    //         }
    //         const _skus: SkuProps[] = [];
    //         for (let index = 0; index < 1000; index++) {
    //             _skus.push({
    //                 id: index + '',
    //                 skuId: '7264419583317082424',
    //                 skuName: "尺码:XL;颜色:黑色",
    //                 sysSpuId: '191784',
    //                 sysSkuId: "1",
    //                 sysSkuName: "黑色/XL",
    //             });
    //         }

    //         resolve({ spu: _spu, skus: _skus, });

    //     } catch (error) {
    //         reject(errorMessage())
    //     }
    // });
}

export function sysSpuSearch(keyword: string): Promise<SysSpuProps[]> {
    return window.sysSpuSearch(keyword);
    // return new Promise((resolve, reject) => {
    //     try {
    //         setTimeout(() => {
    //             const _options: SysSpuProps[] = [
    //                 {
    //                     sysSpuId: '1',
    //                     sysTitle: '111云仓入仓商品2',
    //                     sysImage: "https://p3-aio.ecombdimg.com/obj/ecom-shop-material/FRkEbVqO_m_fe71ff2eab1a2a391705100d038b3a75_sx_383691_www800-800",
    //                 }, {
    //                     sysSpuId: '2',
    //                     sysTitle: '22222云仓入仓商品2',
    //                     sysImage: "https://p3-aio.ecombdimg.com/obj/ecom-shop-material/FRkEbVqO_m_fe71ff2eab1a2a391705100d038b3a75_sx_383691_www800-800",
    //                 }
    //             ];

    //             resolve(_options);
    //         }, 1000);
    //     } catch (error) {
    //         reject(errorMessage())
    //     }
    // });
}

export function getSysSkus(sysSpuId: string | number): Promise<SysSkuProps[]> {
    return window.getSysSkus(sysSpuId);
    // return new Promise((resolve, reject) => {
    //     try {
    //         setTimeout(() => {
    //             const _options: SysSkuProps[] = [
    //                 {
    //                     sysSkuId: '1',
    //                     sysSkuName: '黑色/XXXL',
    //                 }, {
    //                     sysSkuId: '2',
    //                     sysSkuName: '黑色/XXL',
    //                 }
    //             ];
    //             resolve(_options);
    //         }, 1000);
    //     } catch (error) {
    //         reject(errorMessage())
    //     }
    // });
}

export function saveSpuInfo(info: SaveSpuInfoProps): Promise<void> {
    return window.saveSpuInfo(info);
    // return new Promise((resolve, reject) => {
    //     try {
    //         setTimeout(() => {
    //             resolve();
    //         }, 1000);
    //     } catch (error) {
    //         reject(errorMessage())
    //     }
    // });
}

function errorMessage(message?: string, code?: string, details?: string): ErrorProps {
    return {
        code: code || -1,
        message: message || "请求失败",
        details: details,
    }
}