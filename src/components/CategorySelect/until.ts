import { Category, CategoryGroup, CategoryTree } from "./interface";

export function flattenTree(nodes?: CategoryTree[], parentId?: string | number) {
    const result: Category[] = [];
    if (!nodes || nodes.length === 0) { return result; }
    for (let i = 0; i < nodes.length; i++) {
        const { id, name, children, groupName } = nodes[i];
        const hasChild = children?.length > 0;
        result.push({ id, name, parentId, hasChild, groupName });
        if (hasChild) {
            result.push(...flattenTree(children, id));
        }
    }
    return result;
}

export function groupShowData(data: Category[]): CategoryGroup[] {
    let vals: CategoryGroup[] = [];
    const tempData = [...(data || [])];
    tempData.forEach((f: any) => {
        const tempVal = vals.find((fi) => fi.groupName == f.groupName);
        if (tempVal) { tempVal.cates.push(f); }
        else { vals.push({ groupName: f.groupName, cates: [f] }); }
    });
    return vals;
}