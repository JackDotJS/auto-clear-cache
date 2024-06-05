// Generated by wxt
import "wxt/browser";

declare module "wxt/browser" {
  export type PublicPath =
    | "/background.js"
    | "/dark_128x.png"
    | "/dark_16x.png"
    | "/dark_256x.png"
    | "/dark_32x.png"
    | "/dark_64x.png"
    | "/icon_src/acc1.blend"
    | "/icon_src/acc2.blend"
    | "/icon_src/acc3.blend"
    | "/icon_src/acc4.blend"
    | "/icon_src/acc5.blend"
    | "/light_128x.png"
    | "/light_16x.png"
    | "/light_256x.png"
    | "/light_32x.png"
    | "/light_64x.png"
    | "/options.html"
    | "/popup.html"
    | "/welcome.html"
  type HtmlPublicPath = Extract<PublicPath, `${string}.html`>
  export interface WxtRuntime extends Runtime.Static {
    getURL(path: PublicPath): string;
    getURL(path: `${HtmlPublicPath}${string}`): string;
  }
}
