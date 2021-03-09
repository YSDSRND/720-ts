import {Func1, Map, StringLike} from "./types";

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

/* @see https://github.com/symfony/symfony/blob/5.1/src/Symfony/Component/HttpFoundation/Response.php */
export enum HttpStatus {
    Continue = 100,
    SwitchingProtocols = 101,
    Processing = 102,
    EarlyHints = 103,
    Ok = 200,
    Created = 201,
    Accepted = 202,
    NonAuthoritativeInformation = 203,
    NoContent = 204,
    ResetContent = 205,
    PartialContent = 206,
    MultiStatus = 207,
    AlreadyReported = 208,
    ImUsed = 226,
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    SeeOther = 303,
    NotModified = 304,
    UseProxy = 305,
    Reserved = 306,
    TemporaryRedirect = 307,
    PermanentlyRedirect = 308,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    ProxyAuthenticationRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    RequestEntityTooLarge = 413,
    RequestUriTooLong = 414,
    UnsupportedMediaType = 415,
    RequestedRangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    IAmATeapot = 418,
    MisdirectedRequest = 421,
    UnprocessableEntity = 422,
    Locked = 423,
    FailedDependency = 424,
    ReservedForWebdavAdvancedCollectionsExpiredProposal = 425,
    TooEarly = 425,
    UpgradeRequired = 426,
    PreconditionRequired = 428,
    TooManyRequests = 429,
    RequestHeaderFieldsTooLarge = 431,
    UnavailableForLegalReasons = 451,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    VersionNotSupported = 505,
    VariantAlsoNegotiatesExperimental = 506,
    InsufficientStorage = 507,
    LoopDetected = 508,
    NotExtended = 510,
    NetworkAuthenticationRequired = 511,
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

type HeaderMap = {
    [key: string]: string
}

export function extractHeaders(data: string): HeaderMap {
    const pattern = /(\S+)(?:\s*):(?:\s*)(\S+)/gi
    const out: HeaderMap = {}
    let match: RegExpMatchArray | null

    while ((match = pattern.exec(data)) !== null) {
        const key = match[1].trim()
        out[key] = match[2].trim()
    }

    return out
}

export class XMLHttpRequestBackend implements Backend {
    protected attachHandlers(request: XMLHttpRequest, resolve: Func1<Response, void>, reject: Func1<unknown, void>) {
        request.onload = e => {
            const res: Response = {
                status: request.status,
                headers: extractHeaders(request.getAllResponseHeaders()),
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
        const headers =  {
            ...this.defaultHeaders,
            ...request.headers,
        }
        const req: Request = {
            ...request,
            headers: headers,
        }

        return this.backend.send(req).then(res => {
            if (res.status >= 200 && res.status < 400) {
                return Promise.resolve(res)
            }
            return Promise.reject<Response>(res)
        })
    }

}
