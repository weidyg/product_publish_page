export function getSkuPropObj(sku: any, propName: any) {
    return sku?.props?.find((f: { name: string; }) => f.name == propName);
}

export function getSkuGroupObj(skus: any[], salePropName: string) {
    const skusObj: { [key: string]: any[] } = {};
    for (let index = 0; index < skus.length; index++) {
        const sku = skus[index];
        const skuPropVal = getSkuPropObj(sku, salePropName)?.value || '_';
        if (!skusObj[skuPropVal]) { skusObj[skuPropVal] = []; }
        skusObj[skuPropVal].push(sku);
    }
    return skusObj;
}

export function flat(arr: any[]): any[] {
    return [].concat(...arr.map((x: any) => Array.isArray(x) ? flat(x) : x))
};
