const ASSETS_TYPE = ["img", "css", "script", "link", "audio", "video"];
const TIME_THRESHOLD = 2000;

let currentResPosition = 0;
let errImgList = [];

// 获取资源的类型
export const getResType = (url) => {
  const resTypeResult = /[^?%&=#]+\.(\w+)/.exec(url) || [];
  const resType = resTypeResult[1];
  return resType || "";
};

export const sendLog = (data) => {
  console.log("log data", data);
  // 调用一个api 上报到后台服务
};

const filterEntries = (entries) => {
  setTimeout(() => {
    entries.forEach((entry) => {
      const { initiatorType, name, duration } = entry;

      //错误的图片不上报
      if (errImgList.indexOf(name) > -1) {
        return;
      }

      // 搜集加载时间大于阈值(2000毫秒)的静态资源
      if (
        ASSETS_TYPE.indexOf(initiatorType) > -1 &&
        duration > TIME_THRESHOLD
      ) {
        const pageUrl = window.location.href;
        const {
          domainLookupStart,
          domainLookupEnd,
          connectStart,
          connectEnd,
          requestStart,
          responseStart,
          responseEnd,
          duration,
        } = entry;
        const speedData = {
          type: "slow",
          url: name,
          method: "get",
          resType: getResType(name),
          pageUrl,
          domainLookupStart,
          domainLookupEnd,
          connectStart,
          connectEnd,
          requestStart,
          responseStart,
          responseEnd,
          duration,
        };
        sendLog(speedData);
      }
    });
  }, 100);
};

const initSlowReporter = () => {
  const resType = "resource";
  filterEntries(performance.getEntriesByType(resType));

  if (typeof window.PerformanceObserver === "function") {
    const observer = new window.PerformanceObserver((list) => {
      console.log("entries", list.getEntries());

      filterEntries(list.getEntries());
    });
    observer.observe({ entryTypes: [resType] });
  } else {
    // 不支持动态监听，则定时获取资源，并且过滤掉已经上报的部分
    setInterval(() => {
      const allEntries = performance.getEntriesByType(resType);
      const currentEntries = allEntries.slice(this.currentResPosition);
      currentResPosition = currentEntries.length;
      filterEntries(currentEntries);
    }, 3000);
  }
};

const initErrorReporter = () => {
  window.document.addEventListener(
    "error",
    (event) => {
      console.log("ddd");
      if (!event || !event.target || !event.srcElement) {
        return;
      }
      const target = event.target || event.srcElement;
      const url = target.src || target.href;

      // 发生错误的图片存起来，因为错误的也会放在 entries 中，用来过滤
      if (target.nodeName === "IMG") {
        errImgList.push(url);
      }
      // 将错误上报到资源测速
      if (url) {
        const logErrData = {
          type: "error",
          url,
          method: "get",
          pageUrl: window.location.href,
          resType: getResType(url),
        };
        sendLog(logErrData);
      }
    },
    true
  );
};

export const initAssetsReporter = () => {
  initErrorReporter();
  initSlowReporter();

  // 满了就清零
  performance.onresourcetimingbufferfull = () => {
    currentResPosition = 0;
    performance.clearResourceTimings();
  };
};
