import { collectResponsiveData } from "./collect";

declare global {
  interface Window {
    __PRECHECK_COLLECT_RESPONSIVE_DATA__?: typeof collectResponsiveData;
  }
}

window.__PRECHECK_COLLECT_RESPONSIVE_DATA__ = collectResponsiveData;