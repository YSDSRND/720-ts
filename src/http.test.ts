import {buildUrl, extractHeaders, HttpClient, MockBackend, XMLHttpRequestBackend} from "../src/http"

describe('HttpClient tests', () => {

    let backend: MockBackend
    let client: HttpClient

    beforeEach(() => {
        backend = new MockBackend()
        client = new HttpClient(backend)
    })

    it('should send requests properly', (done) => {
        backend.handlers.push(request => {
            return {
                status: 200,
                headers: {},
                body: 'Yee boi',
            }
        })

        client.send({ method: 'GET', url: '/' }).then(res => {
            expect(res.status).toBe(200)
            expect(res.body).toBe('Yee boi')

            done()
        })
    })

    it('should forward default headers', (done) => {
        backend.handlers.push(request => {
            expect(request.headers!['Content-Type']).toBe('application/json')

            return {
                status: 200,
                headers: {},
                body: 'Yee boi',
            }
        })

        client.defaultHeaders['Content-Type'] = 'application/json'

        client.send({ method: 'GET', url: '/' }).then(res => {
            done()
        })
    })

    it('should reject responses outside 200 >= x < 400', (done) => {
        backend.handlers.push(request => {
            return {
                status: 400,
                headers: {},
                body: 'Yee boi',
            }
        })

        client.send({ method: 'GET', url: '/' }).then(undefined, res => {
            done()
        })
    })

})

describe('XMLHttpRequestBackend tests', () => {

    jest.setTimeout(10000)

    let backend: XMLHttpRequestBackend

    beforeEach(() => {
        backend = new XMLHttpRequestBackend()
    })

    it('should send requests', (done) => {
        backend.send({ method: 'GET', url: 'https://enable-cors.org' }).then(res => {
            expect(res.status).toBe(200)
            expect(res.body).toBeTruthy()
            done()
        }, (e) => {
            done()
        })
    })

})

describe('buildUrl tests', () => {
    it('should serialize single arguments properly', () => {
        const url = buildUrl('http://google.com', {
            yee: 'boi',
        })
        expect(url).toBe('http://google.com?yee=boi')
    })

    it('should serialize multiple arguments properly', () => {
        const url = buildUrl('http://google.com', {
            yee: 'boi',
            boi: 'yee',
        })
        expect(url).toBe('http://google.com?yee=boi&boi=yee')
    })

    it('should URL-encode arguments', () => {
        const url = buildUrl('http://google.com', {
            yee: '&boi',
        })
        expect(url).toBe('http://google.com?yee=%26boi')
    })

    it('should accept array-like arguments', () => {
        const url = buildUrl('http://google.com', {
            yee: [1, 2, 3],
        })

        expect(url).toBe('http://google.com?yee[]=1&yee[]=2&yee[]=3')
    })
})

describe('extractHeader tests', () => {
    it('should extract stuff', () => {
        const lines = `
Accept: application/json
Content-Type: yee
        `

        const headers = extractHeaders(lines)

        expect(headers).toEqual({
            'Accept': 'application/json',
            'Content-Type': 'yee',
        })
    })

    it('should disregard incomplete headers', () => {
        const lines = `
A B C
D: E
        `
        const headers = extractHeaders(lines)
        expect(headers).toEqual({
            'D': 'E',
        })
    })
})