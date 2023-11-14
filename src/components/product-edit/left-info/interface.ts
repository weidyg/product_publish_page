
export interface LeftProdInfoProps {
    data?: ProdInfo
}

export interface ProdInfo {
    title: string;
    image: string;
    code: string;
    price: number;
    marketPrice: number;
    cateProp: Array<{
        name: string;
        values: Array<string>;
    }>;
    saleProp: Array<{
        name: string;
        values: Array<string>;
    }>;
    skus: Array<{
        props: Array<{
            name: string;
            value: string;
        }>;
        code: string;
        price: number;
    }>;
}
