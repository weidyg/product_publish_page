import { RequestOptions, UploadRequest } from "@arco-design/web-react/es/Upload/interface";
import { ImageInfo } from "./interface";
import { getImageUploadConfig } from "./api";

// const action = 'http://localhost:60486/api/services/app/ProductPublish/UploadImages1';
// const convertData = (response: { Success: any; Error: any; Result: any; }) => {
//   const s = response?.Success;
//   const e = response?.Error;
//   const m = response?.Result;

//   const error = e && {
//     code: e.Code,
//     message: e.Message,
//     details: e.Details,
//   }

//   const result = s && m && {
//     id: m.Id,
//     name: m.FileName,
//     pix: '',
//     size: m.FileSize,
//     url: m.Url,
//     folderId: m.FolderId,
//     time: m.CreationTime,
//   }
//   return { error, ...result };
// };

const NOOP = () => { };
const errorMessage = (code?: number, message?: string, details?: string) => {
  return { error: { code, message, details } };
};

type ImageInfoResponse = ImageInfo & { error?: { code?: number, message?: string, details?: string, } };
function getResponse(xhr: XMLHttpRequest, ev: ProgressEvent, convertData: ((arg0: any) => ImageInfoResponse)): ImageInfoResponse {
  if (xhr.status < 200 || xhr.status >= 300) { return errorMessage(xhr.status, xhr.statusText, xhr.responseText,); }
  const text = xhr.responseText || xhr.response;
  if (!text) { return errorMessage(-1, 'error', `${ev}`); }
  try {
    const response = JSON.parse(text);
    return convertData(response);
  }
  catch (e) {
    return errorMessage(-1, text, `${e}`);
  }
}
function appendData(data: object, callback: any) {
  for (const key in data) {
    if (isValidKey(key, data) && data[key] != null) {
      callback(key, data[key]);
    }
  }
}
function isValidKey(key: string | number | symbol, object: object): key is keyof typeof object {
  return key in object;
}

export const uploadRequest: UploadRequest = function (options: RequestOptions) {
  const {
    onProgress = NOOP,
    onError = NOOP,
    onSuccess = NOOP,
    file,
    // action,
    headers = {},
    name: originName,
    data: originData = {},
    withCredentials = false,
  } = options;
  // console.log('uploadRequest', options);

  const { action, convertRequest, convertResponse } = getImageUploadConfig();
  function getValue(value: string | object | undefined) {
    if (typeof value === 'function') { return value(file); }
    return value;
  }
  const name = getValue(originName) as string;
  const data = getValue(originData) as object;
  const xhr = new XMLHttpRequest();
  if (onProgress && xhr.upload) {
    xhr.upload.onprogress = function (event: ProgressEvent) {
      // console.log('onprogress', xhr, event, event.loaded, event.total);
      let percent;
      if (event.total > 0) { percent = (event.loaded / event.total) * 100; }
      onProgress(parseInt(`${percent}`, 10), event);
    };
  }
  xhr.onerror = function error(event: ProgressEvent) {
    // console.log('onerror', xhr, event);
    var response = getResponse(xhr, event, convertResponse);
    onError(response)
  };
  xhr.onload = function onload(event: ProgressEvent) {
    // console.log('onload', xhr, event);
    var response = getResponse(xhr, event, convertResponse);
    if (response?.error) {
      return onError(response);
    } else {
      onSuccess(response);
    }
  };

  const formData = new FormData();
  const _data = convertRequest(data);
  appendData(_data, (key: string, value: string) => {
    formData.append(key, value);
  });

  // console.log('uploadRequest _data', _data);
  formData.append(name || 'file', file);
  xhr.open('post', action!, true);
  if (withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true;
  }
  
  appendData(headers, (key: string, value: string) => {
    xhr.setRequestHeader(key, value);
  });

  xhr.send(formData);
  return { abort() { xhr.abort(); }, };
};

export default uploadRequest;
