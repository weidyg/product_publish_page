import {UploadStatus } from "@arco-design/web-react/es/Upload";
import { CSSProperties } from "react";


export interface ImageSpaceProps {
    style?: CSSProperties;
    className?: string | string[];
    pageSize: number,
    onItemClick?: (item: ImageInfo) => void,
}

export interface ImageInfo {
    id?: number;
    folderId?: number;
    name?: string;
    pix?: string;
    size?: number;
    url?: string;
    time?: string;

    // uid?: string;
    // status?: UploadStatus;
    // percent?: number;
}
export interface SpaceInfo {
    used?: number,
    total?: number,
    free?: number,
}

export interface ImageUploadInfo extends ImageInfo {
    uid?: string;
    status?: UploadStatus;
    percent?: number;
}