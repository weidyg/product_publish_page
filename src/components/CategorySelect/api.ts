
declare global {
    interface Window {

    }
}

type GetListInput = { parentId?: string | number, };
type GetListResult = {
    id: string | number,
    name: string,
    isParent: boolean,
    groupName?: string,
}[];

export async function getList(input: GetListInput): Promise<GetListResult> {


    const { parentId = 0 } = input;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([
                {
                    id: `${parentId}_1`,
                    name: '靴子' + parentId,
                    isParent: true,
                    groupName: ''
                }, {
                    id: `${parentId}_2`,
                    name: '马丁靴' + parentId,
                    isParent: true,
                    groupName: ''
                }
            ])
        }, 1000);
    })
}

