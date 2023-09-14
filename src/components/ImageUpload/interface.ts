
export type ImageUploadSize = 'default' | 'mini' | 'large';
export interface ImageUploadProps {
    size?: ImageUploadSize,
    text?: string,
    value?: string,
    onChange?: (value?: string) => void
}