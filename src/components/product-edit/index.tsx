import { Ref, createContext, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Card, Form, Spin, } from "@arco-design/web-react";
import { FieldNames } from "../until";
import { ProFormItem } from "../pro-form";
import { MyFormItemProps, ProductEditFormProps } from "./interface";

type ProductEditContextValue = {
    platformId?: number,
    shopId?: number,
    categoryId?: string;
};
export const ProductEditContext = createContext<ProductEditContextValue>({});

function ProductEditForm(props: ProductEditFormProps, ref: Ref<any>) {
    const { formSchema = [], formData = {}, platformId, shopId, categoryId, className, form } = props;
    const [skuFullName, skuStockName, quantityFullName, salePropFieldName] = useMemo(() => {
        const skuProp = formSchema.find((f: MyFormItemProps) => FieldNames.sku(f?.tags));
        const skuStockProp = skuProp?.subItems?.find((f: MyFormItemProps) => FieldNames.skuStock(f?.tags));
        const quantityProp = formSchema.find((f: MyFormItemProps) => FieldNames.quantity(f?.tags));
        const saleProp = formSchema.find((f: MyFormItemProps) => FieldNames.saleProp(f?.tags));
        const salePropName = saleProp?.namePath?.join('.') || saleProp?.name;
        if (skuProp && skuStockProp && quantityProp) {
            const skuName = skuProp.namePath?.join('.') || skuProp.name;
            const skuStockName = skuStockProp.name;
            const quantityName = quantityProp.namePath?.join('.') || skuStockProp.name;
            return [skuName, skuStockName, quantityName, salePropName];
        }
        return [undefined, undefined, undefined, salePropName];
    }, [JSON.stringify(formSchema)]);

    useEffect(() => {
        form?.setFieldsValue(formData || {});
        setLoading(false);
    }, [JSON.stringify(formData)])

    const [loading, setLoading] = useState(true);
    // const [form] = Form.useForm();
    useImperativeHandle(ref, () => {

    });

    return (
        <Spin loading={loading} style={{ display: 'block' }}>
            <Card hoverable className={className}>
                <ProductEditContext.Provider value={{ platformId, shopId, categoryId }}>
                    <Form id='spuForm'
                        form={form}
                        labelCol={{ span: 3, offset: 0 }}
                        wrapperCol={{ span: 21, offset: 0 }}
                        // layout='vertical'
                        layout='horizontal'
                        autoComplete='off'
                        scrollToFirstError={true}
                        // disabled={saveLoading || publishLoading}
                        // onSubmit={(values: FormData) => {
                        //     console.log('onSubmit', values);
                        // }}
                        // onSubmitFailed={(errors: { [key: string]: FieldError; }) => {
                        //     console.log('onSubmitFailed', errors);
                        // }}
                        onValuesChange={(value, values) => {
                            if (form && skuFullName && skuStockName && quantityFullName) {
                                const skuChanged = Object.keys(value).some(s => s.endsWith(skuFullName!));
                                if (skuChanged) {
                                    let quantity = 0;
                                    const skus: any[] = form.getFieldValue(skuFullName!) || [];
                                    skus.forEach(f => { quantity += parseInt(f[skuStockName!]) || 0; });
                                    const oldQuantity = form.getFieldValue(quantityFullName!);
                                    if (oldQuantity != quantity) { form.setFieldValue(quantityFullName!, quantity); }
                                }
                            }
                        }}
                        validateMessages={{
                            required: (_, { label }) => <>{'必填项'}{label || ''}{'不能为空,请修改'}</>,
                            string: {
                                length: `字符数必须是 #{length}`,
                                match: `不匹配正则 #{pattern}`,
                            },
                        }}
                    >
                        {formSchema.map((m: MyFormItemProps, i: any) => {
                            return <ProFormItem key={i} {...m} salePropFieldName={salePropFieldName} />
                        })}
                    </Form>
                </ProductEditContext.Provider>
            </Card>
        </Spin>
    );
}

const ProductEditFormComponent = forwardRef(ProductEditForm);
ProductEditFormComponent.displayName = 'ProductEditForm';
export default ProductEditFormComponent