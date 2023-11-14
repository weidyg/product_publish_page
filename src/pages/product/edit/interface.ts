import { MyFormItemProps } from "../../../components/product-edit/interface";
import { ProdInfo } from "../../../components/product-edit/left-info/interface";

export interface ProductEditDataProps {
    itemId: number,
    platformId: number,
    platformName: string;
    shopId: number,
    shopName: string;
    categoryId: string;
    categoryNamePath: string;
    formSchema: MyFormItemProps[];
    formData: { [x: string]: any };
    origProdInfo:ProdInfo;
}