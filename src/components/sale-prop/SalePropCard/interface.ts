export type SalePropOption = {
    value: string,
    label?: string,
    options?: SalePropOption[]
}

export interface SalePropCardProps {
    options?: SalePropOption[],
    group?: string,
    values?: string[],
    onOk?: (values?: string[], group?: string) => void,
    onCancel?: () => void,
}