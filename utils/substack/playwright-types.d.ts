declare module 'playwright' {
  export interface Browser {
    newContext(options?: any): Promise<BrowserContext>;
    close(): Promise<void>;
  }

  export interface BrowserContext {
    addCookies(cookies: any[]): Promise<void>;
    cookies(): Promise<any[]>;
    newPage(): Promise<Page>;
    pages(): Page[];
    close(): Promise<void>;
  }

  export interface Page {
    url(): string;
    goto(url: string, options?: any): Promise<any>;
    waitForTimeout(ms: number): Promise<void>;
    waitForURL(url: string | RegExp, options?: any): Promise<void>;
    waitForSelector(selector: string, options?: any): Promise<any>;
    fill(selector: string, text: string): Promise<void>;
    click(selector: string): Promise<void>;
    $(selector: string): Promise<any>;
    keyboard: {
      press(key: string): Promise<void>;
      type(text: string): Promise<void>;
    };
  }

  export interface ChromiumBrowser {
    launch(options?: any): Promise<Browser>;
    launchPersistentContext(
      userDataDir: string,
      options?: any,
    ): Promise<BrowserContext>;
  }

  export const chromium: ChromiumBrowser;
}
