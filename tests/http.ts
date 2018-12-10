import {HttpClient, MockBackend, XMLHttpRequestBackend} from "../src/http"

describe('HttpClient tests', function () {

    let backend: MockBackend
    let client: HttpClient

    beforeEach(function () {
        backend = new MockBackend()
        client = new HttpClient(backend)
    })

    it('should send requests properly', function (done) {
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

    it('should forward default headers', function (done) {
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

    it('should reject responses outside 200 >= x < 400', function (done) {
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

describe('XMLHttpRequestBackend tests', function () {

    let backend: XMLHttpRequestBackend

    beforeEach(function () {
        backend = new XMLHttpRequestBackend
    })

    it('should send requests', function (done) {
        backend.send({ method: 'GET', url: 'https://enable-cors.org' }).then(res => {
            expect(res.status).toBe(200)
            expect(res.body).toBeTruthy()
            done()
        })
    })

})