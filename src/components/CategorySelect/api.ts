
declare global {
    interface Window {

    }
}

export async function getList(input: {
    parentId?: number,
}): Promise<any> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                id: 1,
                name: '靴子'
            }])
        }, 1000);
    })
}