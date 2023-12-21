
export type ImageUploadSize = 'mini' | 'large';
export interface ImageUploadProps {
    size?: ImageUploadSize,
    text?: string,
    defaultValue?: string,
    value?: string,
    onChange?: (value?: string) => void
}