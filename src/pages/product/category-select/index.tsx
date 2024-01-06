import CategorySelect from "../../../components/CategorySelect";
import { setCategorys, getCategorys } from "../../../components/CategorySelect/api";
import { Category } from "../../../components/CategorySelect/interface";

function CategorySelectPage() {

    const loadCateList = async function (parentId?: string | number): Promise<Category[] | undefined> {
        const cateData = await getCategorys(undefined, parentId!);
        return cateData;
    };

    const categoryNamePath = '';

    return <CategorySelect
        title={<>{`选择商品类目`}
            {categoryNamePath
                ? <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
                    {`（参考类目：${categoryNamePath}）`}
                </span>
                : ''}
        </>}
        onGetChildrens={loadCateList}
        onSubmit={async (cates) => {
            await setCategorys(cates);
        }} />
}

export default CategorySelectPage;

