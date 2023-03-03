import { Response } from "@google-cloud/functions-framework";
import { Errback, CookieOptions, Locals, Application, Request, ParamsDictionary } from "express-serve-static-core";
import { OutgoingHttpHeaders, OutgoingHttpHeader } from "http";
import { Socket } from "net";
import { ParsedQs } from "qs";
import { Readable } from "stream";

interface Use {
    method: UsedMethod;
    methodRef: any;

    status?: {
        code: number;
    };

    send?: {
        body: any;
    };

    json?: {
        body: any;
    };

    jsonp?: {
        body: any;
    }
}

export enum UsedMethod {
    SEND,
    STATUS,
    JSON,
    JSON_P
}

export class MockHttpResponse implements Response {
    private readonly uses: Use[] = [];
    private useIndex: number = 0;

    public mockedUses(): Use[] {
        return this.uses;
    }

    public mockedNextUse(): Use | null {
        return (this.uses.length > this.useIndex) ? this.uses[this.useIndex++] : null;
    }

    public mockedUsesOf(method: UsedMethod): Use[] {
        return this.uses.filter(use => use.method === method);
    }

    status(code: number): this {
        this.statusCode = code;
        this.uses.push({
            method: UsedMethod.STATUS,
            methodRef: this.status,
            status: {
                code: code
            }
        });
        return this;
    }

    send(body: any): this {
        this.uses.push({
            method: UsedMethod.SEND,
            methodRef: this.send,
            send: {
                body: body
            }
        });
        return this;
    }

    sendStatus(code: number): this {
        throw new Error("Method not implemented.");
    }

    links(links: any): this {
        throw new Error("Method not implemented.");
    }

    json(body: any): this {
        this.uses.push({
            method: UsedMethod.JSON,
            methodRef: this.json,
            json: {
                body: body
            }
        });
        return this;
    }


    jsonp(body: any): this {
        this.uses.push({
            method: UsedMethod.JSON_P,
            methodRef: this.jsonp,
            jsonp: {
                body: body
            }
        });
        return this;
    }

    sendFile(path: string, fn?: Errback | undefined): void;
    sendFile(path: string, options: any, fn?: Errback | undefined): void;
    sendFile(path: unknown, options?: unknown, fn?: unknown): void {
        throw new Error("Method not implemented.");
    }
    sendfile(path: string): void;
    sendfile(path: string, options: any): void;
    sendfile(path: string, fn: Errback): void;
    sendfile(path: string, options: any, fn: Errback): void;
    sendfile(path: unknown, options?: unknown, fn?: unknown): void {
        throw new Error("Method not implemented.");
    }
    download(path: string, fn?: Errback | undefined): void;
    download(path: string, filename: string, fn?: Errback | undefined): void;
    download(path: string, filename: string, options: any, fn?: Errback | undefined): void;
    download(path: unknown, filename?: unknown, options?: unknown, fn?: unknown): void {
        throw new Error("Method not implemented.");
    }
    contentType(type: string): this {
        throw new Error("Method not implemented.");
    }
    type(type: string): this {
        throw new Error("Method not implemented.");
    }
    format(obj: any): this {
        throw new Error("Method not implemented.");
    }
    attachment(filename?: string | undefined): this {
        throw new Error("Method not implemented.");
    }
    set(field: any): this;
    set(field: string, value?: string | string[] | undefined): this;
    set(field: unknown, value?: unknown): this {
        throw new Error("Method not implemented.");
    }
    header(field: any): this;
    header(field: string, value?: string | string[] | undefined): this;
    header(field: unknown, value?: unknown): this {
        throw new Error("Method not implemented.");
    }
    headersSent: boolean = false;
    get(field: string): string | undefined {
        throw new Error("Method not implemented.");
    }
    clearCookie(name: string, options?: CookieOptions | undefined): this {
        throw new Error("Method not implemented.");
    }
    cookie(name: string, val: string, options: CookieOptions): this;
    cookie(name: string, val: any, options: CookieOptions): this;
    cookie(name: string, val: any): this;
    cookie(name: unknown, val: unknown, options?: unknown): this {
        throw new Error("Method not implemented.");
    }
    location(url: string): this {
        throw new Error("Method not implemented.");
    }
    redirect(url: string): void;
    redirect(status: number, url: string): void;
    redirect(url: string, status: number): void;
    redirect(url: unknown, status?: unknown): void {
        throw new Error("Method not implemented.");
    }
    render(view: string, options?: object | undefined, callback?: ((err: Error, html: string) => void) | undefined): void;
    render(view: string, callback?: ((err: Error, html: string) => void) | undefined): void;
    render(view: unknown, options?: unknown, callback?: unknown): void {
        throw new Error("Method not implemented.");
    }
    locals: Record<string, any> & Locals = {};
    charset: string = "utf-8";
    vary(field: string): this {
        throw new Error("Method not implemented.");
    }
    app: Application<Record<string, any>> = {} as Application<Record<string, any>>;
    append(field: string, value?: string | string[] | undefined): this {
        throw new Error("Method not implemented.");
    }
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> = {} as Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
    statusCode: number = -1;
    statusMessage: string = "";
    assignSocket(socket: Socket): void {
        throw new Error("Method not implemented.");
    }
    detachSocket(socket: Socket): void {
        throw new Error("Method not implemented.");
    }
    writeContinue(callback?: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }
    writeEarlyHints(hints: Record<string, string | string[]>, callback?: (() => void) | undefined): void {
        throw new Error("Method not implemented.");
    }
    writeHead(statusCode: number, statusMessage?: string | undefined, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined): this;
    writeHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined): this;
    writeHead(statusCode: unknown, statusMessage?: unknown, headers?: unknown): this {
        throw new Error("Method not implemented.");
    }
    writeProcessing(): void {
        throw new Error("Method not implemented.");
    }
    chunkedEncoding: boolean = false;
    shouldKeepAlive: boolean = false;
    useChunkedEncodingByDefault: boolean = false;
    sendDate: boolean = false;
    finished: boolean = false;
    connection: Socket | null = null;
    socket: Socket | null = null;
    setTimeout(msecs: number, callback?: (() => void) | undefined): this {
        throw new Error("Method not implemented.");
    }
    setHeader(name: string, value: string | number | readonly string[]): this {
        throw new Error("Method not implemented.");
    }
    getHeader(name: string): string | number | string[] | undefined {
        throw new Error("Method not implemented.");
    }
    getHeaders(): OutgoingHttpHeaders {
        throw new Error("Method not implemented.");
    }
    getHeaderNames(): string[] {
        throw new Error("Method not implemented.");
    }
    hasHeader(name: string): boolean {
        throw new Error("Method not implemented.");
    }
    removeHeader(name: string): void {
        throw new Error("Method not implemented.");
    }
    addTrailers(headers: OutgoingHttpHeaders | readonly [string, string][]): void {
        throw new Error("Method not implemented.");
    }
    flushHeaders(): void {
        throw new Error("Method not implemented.");
    }
    writable: boolean = false;
    writableEnded: boolean = false;
    writableFinished: boolean = false;
    writableHighWaterMark: number = -1;
    writableLength: number = -1;
    writableObjectMode: boolean = false;
    writableCorked: number = -1;
    destroyed: boolean = false;
    closed: boolean = false;
    errored: Error | null = null;
    writableNeedDrain: boolean = false;
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
        throw new Error("Method not implemented.");
    }
    _writev?(chunks: { chunk: any; encoding: BufferEncoding; }[], callback: (error?: Error | null | undefined) => void): void {
        throw new Error("Method not implemented.");
    }
    _construct?(callback: (error?: Error | null | undefined) => void): void {
        throw new Error("Method not implemented.");
    }
    _destroy(error: Error | null, callback: (error?: Error | null | undefined) => void): void {
        throw new Error("Method not implemented.");
    }
    _final(callback: (error?: Error | null | undefined) => void): void {
        throw new Error("Method not implemented.");
    }
    write(chunk: any, callback?: ((error: Error | null | undefined) => void) | undefined): boolean;
    write(chunk: any, encoding: BufferEncoding, callback?: ((error: Error | null | undefined) => void) | undefined): boolean;
    write(chunk: unknown, encoding?: unknown, callback?: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    setDefaultEncoding(encoding: BufferEncoding): this {
        throw new Error("Method not implemented.");
    }
    end(cb?: (() => void) | undefined): this;
    end(chunk: any, cb?: (() => void) | undefined): this;
    end(chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined): this;
    end(chunk?: unknown, encoding?: unknown, cb?: unknown): this {
        throw new Error("Method not implemented.");
    }
    cork(): void {
        throw new Error("Method not implemented.");
    }
    uncork(): void {
        throw new Error("Method not implemented.");
    }
    destroy(error?: Error | undefined): this {
        throw new Error("Method not implemented.");
    }
    addListener(event: "close", listener: () => void): this;
    addListener(event: "drain", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "finish", listener: () => void): this;
    addListener(event: "pipe", listener: (src: Readable) => void): this;
    addListener(event: "unpipe", listener: (src: Readable) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    addListener(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    emit(event: "close"): boolean;
    emit(event: "drain"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "finish"): boolean;
    emit(event: "pipe", src: Readable): boolean;
    emit(event: "unpipe", src: Readable): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;
    emit(event: unknown, src?: unknown, ...rest: unknown[]): boolean {
        throw new Error("Method not implemented.");
    }
    on(event: "close", listener: () => void): this;
    on(event: "drain", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "finish", listener: () => void): this;
    on(event: "pipe", listener: (src: Readable) => void): this;
    on(event: "unpipe", listener: (src: Readable) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    once(event: "close", listener: () => void): this;
    once(event: "drain", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "finish", listener: () => void): this;
    once(event: "pipe", listener: (src: Readable) => void): this;
    once(event: "unpipe", listener: (src: Readable) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "drain", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "finish", listener: () => void): this;
    prependListener(event: "pipe", listener: (src: Readable) => void): this;
    prependListener(event: "unpipe", listener: (src: Readable) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependListener(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "drain", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "finish", listener: () => void): this;
    prependOnceListener(event: "pipe", listener: (src: Readable) => void): this;
    prependOnceListener(event: "unpipe", listener: (src: Readable) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "drain", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "finish", listener: () => void): this;
    removeListener(event: "pipe", listener: (src: Readable) => void): this;
    removeListener(event: "unpipe", listener: (src: Readable) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean | undefined; } | undefined): T {
        throw new Error("Method not implemented.");
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeAllListeners(event?: string | symbol | undefined): this {
        throw new Error("Method not implemented.");
    }
    setMaxListeners(n: number): this {
        throw new Error("Method not implemented.");
    }
    getMaxListeners(): number {
        throw new Error("Method not implemented.");
    }
    listeners(eventName: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    rawListeners(eventName: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    listenerCount(eventName: string | symbol): number {
        throw new Error("Method not implemented.");
    }
    eventNames(): (string | symbol)[] {
        throw new Error("Method not implemented.");
    }

}
