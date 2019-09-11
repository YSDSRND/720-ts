import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Link, RedirectRoute, Route, Router, StateProvider} from "../../src/react/Router"
import {EventEmitter} from '../../src/events'

export class MockStateProvider implements StateProvider {
    public readonly events = new EventEmitter()
    private currentPath: string

    constructor(path: string = '') {
        this.currentPath = path
    }

    public current() {
        return this.currentPath
    }

    public push(path: string) {
        this.events.trigger('change', path)
        this.currentPath = path
    }
}

describe('Route tests', () => {
    it('should match correctly', () => {
        const route = new Route('/yee', props => {
            return null
        })
        const match = route.matches('/yee', new MockStateProvider())
        expect(match).toBeTruthy()
        expect(match!.params).toEqual({})
    })

    it('should match route exactly', () => {
        const route = new Route('/yee/aaa', props => {
            return null
        })
        const match = route.matches('/yee', new MockStateProvider())
        expect(match).toBeUndefined()
    })

    it('should extract parameters correctly', () => {
        const route = new Route('/yee/{id}/{name}', props => {
            return null
        })
        const match = route.matches('/yee/1/2', new MockStateProvider())
        expect(match).toBeTruthy()
        expect(match!.params).toEqual({
            id: '1',
            name: '2',
        })
    })

    it('should disregard trailing slash in path', () => {
        const route = new Route('/yee', props => {
            return null
        })
        const match = route.matches('/yee/', new MockStateProvider())
        expect(match).toBeTruthy()
        expect(match!.params).toEqual({})
    })

    it('should require parameters to match supplied patterns', () => {
        const route = new Route('/yee/{id:\\d+}', props => null)
        expect(route.matches('/yee/15', new MockStateProvider())).toBeTruthy()
        expect(route.matches('/yee/YEE', new MockStateProvider())).toBeUndefined()
    })

    it('should match multiple route parameters', () => {
        const route = new Route('/{a:\\d+}/{b:\\w+}', props => null)
        const match = route.matches('/12/hello/', new MockStateProvider())

        expect(match).toBeTruthy()
        expect(match!.params).toEqual({
            a: '12',
            b: 'hello',
        })
    })

    it('should match slash route', () => {
        const route = new Route('/', props => null)
        const match = route.matches('/', new MockStateProvider())

        expect(match).toBeTruthy()
    })
})

describe('Router tests', () => {
    let element: Element | undefined

    beforeEach(() => {
        element = document.createElement('div')
        document.body.appendChild(element)
    })

    afterEach(() => {
        document.body.removeChild(element!)
        element = undefined
    })

    it('should render matched route', () => {
        ReactDOM.render(
            <Router
                context={undefined}
                routes={[
                    new Route('/yee', props => {
                        return (
                            <span>Match</span>
                        )
                    }),
                ]}
                stateProvider={new MockStateProvider('/yee')}
            />, element!
        )

        expect(document.body.innerText).toBe('Match')
    })

    it('should render first matched route', () => {
        ReactDOM.render(
            <Router
                context={undefined}
                routes={[
                    new Route('/yee', props => {
                        return (
                            <span>Match</span>
                        )
                    }),
                    new Route('/yee', props => {
                        return (
                            <span>Nope</span>
                        )
                    }),
                ]}
                stateProvider={new MockStateProvider('/yee')}
            />, element!
        )

        expect(document.body.innerText).toBe('Match')
    })

    it('should provide params to component', () => {
        ReactDOM.render(
            <Router
                context={undefined}
                routes={[
                    new Route('/yee/{id}', props => {
                        return (
                            <span>{props.params.id}</span>
                        )
                    }),
                ]}
                stateProvider={new MockStateProvider('/yee/BOI')}
            />, element!
        )

        expect(document.body.innerText).toBe('BOI')
    })

    it('should provide context to component', () => {
        ReactDOM.render(
            <Router<string>
                context={'Hello'}
                routes={[
                    new Route('/yee', props => {
                        return (
                            <span>{props.context}</span>
                        )
                    }),
                ]}
                stateProvider={new MockStateProvider('/yee')}
            />, element!
        )

        expect(document.body.innerText).toBe('Hello')
    })

    it('should react to state changes', () => {
        const state = new MockStateProvider('/a')
        ReactDOM.render(
            <Router
                context={undefined}
                routes={[
                    new Route('/a', props => {
                        return (
                            <span>a</span>
                        )
                    }),
                    new Route('/b', props => {
                        return (
                            <span>b</span>
                        )
                    }),
                ]}
                stateProvider={state}
            />, element!
        )

        expect(document.body.innerText).toBe('a')
        state.push('/b')
        expect(document.body.innerText).toBe('b')
    })

    it('should render nothing with no matching routes', () => {
        ReactDOM.render(
            <Router
                context={undefined}
                routes={[
                    new Route('/a', props => {
                        return (
                            <span>a</span>
                        )
                    }),
                ]}
                stateProvider={new MockStateProvider('/b')}
            />, element!
        )
        expect(document.body.innerText).toBe('')
    })
})

describe('RedirectRoute tests', () => {
    it('does nothing when route does not match', (done) => {
        const state = new MockStateProvider('/YEE')
        const route = new RedirectRoute('/e', '/f')

        route.matches('/c', state)

        setTimeout(() => {
            expect(state.current()).toBe('/YEE')
            done()
        })
    })

    it('should redirect asynchronously when matched', (done) => {
        const state = new MockStateProvider('/YEE')
        const route = new RedirectRoute('/e', '/f')

        route.matches('/e', state)

        expect(state.current()).toBe('/YEE')

        setTimeout(() => {
            expect(state.current()).toBe('/f')
            done()
        })
    })
})

describe('Link tests', () => {
    let element: HTMLElement | undefined

    beforeEach(() => {
        element = document.createElement('div')
        document.body.appendChild(element)
    })

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(element!)
        document.body.removeChild(element!)
        element = undefined
    })

    it('should not add active class when not matched', () => {
        const state = new MockStateProvider('/boi')

        ReactDOM.render(
            <Link path="/yee"
                  stateProvider={state}>
                Hello World
            </Link>,
            element!
        )

        expect(element!.querySelector('a')!.classList.contains('active')).toBe(false)
    })

    it('should add active class when matched with exact path', () => {
        const state = new MockStateProvider('/yee')

        ReactDOM.render(
            <Link path="/yee"
                  stateProvider={state}>
                Hello World
            </Link>,
            element!
        )

        expect(element!.querySelector('a')!.classList.contains('active')).toBe(true)
    })

    it('should add active class when matched with activePattern', () => {
        const state = new MockStateProvider('/yee')

        ReactDOM.render(
            <Link path="/yee"
                  activePattern={/^\/y/}
                  stateProvider={state}>
                Hello World
            </Link>,
            element!
        )

        expect(element!.querySelector('a')!.classList.contains('active')).toBe(true)
    })

    it('should add specified class when matched', () => {
        const state = new MockStateProvider('/yee')

        ReactDOM.render(
            <Link path="/yee/boi"
                  activeClass="my-class"
                  activePattern={/^\/yee/}
                  stateProvider={state}>
                Hello World
            </Link>,
            element!
        )

        expect(element!.querySelector('a')!.classList.contains('my-class')).toBe(true)
    })
})
