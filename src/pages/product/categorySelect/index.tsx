import CategorySelect, { Category } from "../../../components/CategorySelect";

declare global {
    interface Window {
        getCategorys: any,
        setCategorys: any,
        getCategoryConfig: any,
    }
}
async function getCategorys(shopId?: number, parentId?: string | number): Promise<Category[]> {
    return await window.getCategorys(shopId, parentId);
}

async function setCategorys(categorys: Category[]): Promise<void> {
    return await window.setCategorys(categorys);
}

function getCategoryConfig(): { title: string, categoryNamePath: string } {
    return window.getCategoryConfig();
}

function CategorySelectPage() {

    const loadCateList = async function (parentId?: string | number): Promise<Category[] | undefined> {
        const cateData = await getCategorys(undefined, parentId!);
        return cateData;
    };
    const config = getCategoryConfig();
    return <CategorySelect
        title={<>{config?.title}
            {config?.categoryNamePath
                ? <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
                    {`（参考类目：${config?.categoryNamePath}）`}
                </span>
                : ''}
        </>}
        onGetChildrens={loadCateList}
        onSubmit={async (cates) => {
            await setCategorys(cates);
        }} />
}

export default CategorySelectPage;

