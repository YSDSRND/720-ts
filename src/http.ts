import {Func1, Map, StringLike} from "./types";
import {Promise} from "./promise";
import {assign} from "./assign";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface Request {
    method: HttpMethod
    url: string
    headers?: Map<StringLike>
    query?: Map<StringLike | ReadonlyArray<StringLike>>
    body?: unknown
    responseType?: XMLHttpRequestResponseType
}

export interface Response {
    status: number
    headers: Map<string>
    body: unknown
}

export interface Backend {
    send(request: Request): PromiseLike<Response>
}

export const enum Status {
    Ok = 200,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    UnprocessableEntity = 422,
    Locked = 423,
    InternalServerError = 500,
}

export function buildUrl(base: string, query: Map<StringLike | ReadonlyArray<StringLike>>): string {
    const params: Array<{ key: string, value: string }> = []

    for (const key in query) {
        // serialize array values like so:
        // name[]=bobby&name[]=jean
        let values = query[key]
        let suffix = '[]'

        if (!Array.isArray(values)) {
            values = [values]
            suffix = ''
        }

        params.push(...(values as ReadonlyArray<StringLike>).map(value => {
            return {
                key: key + suffix,
                value: encodeURIComponent(value.toString()),
            }
        }))
    }

    const queryString = params
        .map(pair => `${pair.key}=${pair.value}`)
        .join('&')

    return base + (queryString !== '' ? '?' + queryString : '')
}

export class XMLHttpRequestBackend implements Backend {

    protected extractHeaders(data: string) {
        const lines = data.trim().split('\n')
        const headers: { [key: string]: string } = {}
        lines.forEach(line => {
            const [key, value] = line.split(':')
            headers[key.trim()] = value.trim()
        })

        return headers
    }

    protected attachHandlers(request: XMLHttpRequest, resolve: Func1<Response, void>, reject: Func1<unknown, void>) {
        request.onload = e => {
            const res: Response = {
                status: request.status,
                headers: this.extractHeaders(request.getAllResponseHeaders()),
                body: request.response,
            }
            resolve(res)
        }
        request.onerror = e => {
            reject(e)
        }
    }

    public send(request: Request): PromiseLike<Response> {
        request.query = request.query || {}
        request.headers = request.headers || {}
        request.body = request.body || ''

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest()
            this.attachHandlers(req, resolve, reject)

            req.open(request.method, buildUrl(request.url, request.query!), true)
            req.responseType = request.responseType || ''

            Object.keys(request.headers!).forEach(key => {
                req.setRequestHeader(key, request.headers![key].toString())
            })

            req.send(request.body as any)
        })
    }

}

export class MockBackend implements Backend {

    public handlers: Array<Func1<Request, Response>> = []

    public send(request: Request): PromiseLike<Response> {
        if (!this.handlers.length) {
            throw new RangeError('Response queue empty')
        }

        const handler = this.handlers.shift()

        return Promise.resolve(handler!(request))
    }

}

export class HttpClient {

    protected backend: Backend
    public defaultHeaders: Map<StringLike>

    constructor(backend: Backend) {
        this.backend = backend
        this.defaultHeaders = {}
    }

    public send(request: Request): PromiseLike<Response> {
        const headers = assign({}, request.headers || {}, this.defaultHeaders)
        const req = assign({}, request, {
            headers: headers,
        })

        return this.backend.send(req).then(res => {
            if (res.status >= 200 && res.status < 400) {
                return Promise.resolve(res)
            }
            return Promise.reject<Response>(res)
        })
    }

}
