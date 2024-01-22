## 静态资源加载问题上报工具

网站上线后常常伴随加载慢、网站打不开等反馈，开发人员问题定位时却无法重现，慢慢地此类问题被丢弃一旁。为了解决这些问题，错误上报系统应运而生，此处着重解决静态资源加载情况上报。

## 捕获静态资源类型

```js
const ASSETS_TYPE = ["img", "css", "script", "link", "audio", "video"];
```

## 捕获情况

- 资源加载太慢(超过 2 秒)
- 资源加载报错

## 使用教程

- 使用前提-完善 sendLog 方法

```js
export const sendLog = (data) => {
  console.log("log data", data);
  // 调用一个api 上报到后台服务
};
```

- 全局使用

```js
import { initAssetsReporter } from "./assets_reporter";

initAssetsReporter();
```

- 局部使用-解决个别无法监听的错误情况

```js
import { sendLog } from "./assets_reporter";

const loadImage = () => {
  const img = new Image();
  const url = "***";
  img.src = url;

  img.onload = () => {
    console.log("img onload");
  };

  img.onerror = (error) => {
    console.log("img error", error);
    const logErrData = {
      type: "error",
      url,
      method: "get",
      pageUrl: window.location.href,
      resType: getResType(url),
    };
    sendLog(logErrData);
  };
};

const loadImageByFetch = () => {
  const url = "***";
  fetch(url)
    .then(() => {
      console.log("fetch image load success");
    })
    .catch((error) => {
      console.log("fetch image load failed");
      const logErrData = {
        type: "error",
        url,
        method: "get",
        pageUrl: window.location.href,
        resType: getResType(url),
      };
      sendLog(logErrData);
    });
};
```
