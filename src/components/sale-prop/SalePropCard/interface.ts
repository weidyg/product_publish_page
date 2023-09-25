export type SalePropGroupOption = {
    label: string;
    value: string;
}
export type SalePropOption = SalePropGroupOption & {
    group?: SalePropGroupOption
}

export interface SalePropCardProps {
    isGroup?: boolean,
    options?: SalePropOption[],
    group?: string,
    values?: string[],
    onOk?: (values?: string[], group?: string) => void,
    onCancel?: () => void,
}