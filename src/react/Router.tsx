import * as React from 'react'
import {toArray} from "../toArray";
import {Map} from "../types"
import {EventEmitter} from "../events";
import {assign} from "../assign";
import {classNames} from '../classNames'

export interface RouteComponentProps<TContext> {
    context: TContext
    params: Map<string>
    stateProvider: StateProvider
}
type RouteComponent<TContext> =
    | React.FunctionComponent<RouteComponentProps<TContext>>
    | React.ComponentClass<RouteComponentProps<TContext>>

type Match<TContext> = {
    component: RouteComponent<TContext>
    params: Map<string>
}

export type RouteLike<TContext> = {
    matches(path: string, stateProvider: StateProvider): Match<TContext> | undefined
}

// a route is an object that maps an URL-path to a
// component in the application. the path can contain
// parameters specified as "{name}" which if matched
// will be converted into an object { name: "..." }
export class Route<TContext> implements RouteLike<TContext> {
    private readonly path: string
    private readonly component: RouteComponent<TContext>
    private pattern: RegExp | undefined
    private paramNames: ReadonlyArray<string> = []

    constructor(path: string, component: RouteComponent<TContext>) {
        this.path = path
        this.component = component
    }

    private buildPattern(): void {
        const names: Array<string> = []

        // create a regexp from the path supplied to this
        // route. parameter placeholders defined as "{name}"
        // are extracted into a list of parameter names and
        // converted into regexp match groups. parameter
        // requirements are supported with the syntax
        // {name:PATTERN}, eg. {name:\\d+}.
        const pattern = this.path
            .replace(/\{([^\{\}\(\):]+)(?::([^\{\}\(\)]+))?\}/g, (match, name, req) => {
                names.push(name)
                const requirement = new RegExp(req || '[^\\/]+')
                return `(${requirement.source})`
            })
            // we cannot allow routes to start with these
            // special regexp characters so let's remove them.
            .replace(/^\^+/, '')
            .replace(/\$+$/, '')

        this.pattern = new RegExp(
            // we require exact matches, eg. the route has
            // to start and end exactly as defined.
            '^' + pattern + '$'
        )
        this.paramNames = names
    }

    public matches(path: string, stateProvider: StateProvider): Match<TContext> | undefined {
        if (!this.pattern) {
            this.buildPattern()
        }
        path = path.replace(/\/+$/, '')
        const match = this.pattern!.exec(path)

        if (!match) {
            return undefined
        }

        // build a parameter object from the matched regex.
        // the first element of the array is the whole match
        // so let's remove that first.
        const params = toArray(match)
            .slice(1)
            .reduce((carry, current, index) => {
                const name = this.paramNames[index]
                carry[name] = current
                return carry
            }, {} as Map<string>)

        return {
            component: this.component,
            params: params,
        }
    }
}

export class RedirectRoute<TContext> extends Route<TContext> {
    private readonly toPath: string

    constructor(fromPath: string, toPath: string) {
        super(fromPath, props => null)

        this.toPath = toPath
    }

    public matches(path: string, stateProvider: StateProvider): Match<TContext> | undefined {
        const match = super.matches(path, stateProvider)

        if (match) {
            setTimeout(() => {
                stateProvider.push(this.toPath)
            })
        }

        return match
    }
}

type RouterProps<TContext> = {
    context: TContext
    routes: ReadonlyArray<RouteLike<TContext>>
    stateProvider: StateProvider
}

type RouterState = {
    path: string
}

// the route itself is just a component that listens
// state changes and renders the appropriate route.
// currently we don't do any caching but we may want
// to introduce that in the future. ideally any sort
// of cache should be provided in the route context
// which is injected from the outside.
export class Router<TContext> extends React.Component<RouterProps<TContext>, RouterState> {
    constructor(props: RouterProps<TContext>) {
        super(props)

        this.state = {
            path: props.stateProvider.current(),
        }
        this.onChange = this.onChange.bind(this)
    }

    protected onChange(path: string): void {
        this.setState({ path })
    }

    public componentDidMount(): void {
        this.props.stateProvider.events.subscribe('change', this.onChange)
    }

    public componentWillMount(): void {
        this.props.stateProvider.events.unsubscribe('change', this.onChange)
    }

    public render() {
        for (const route of this.props.routes) {
            const match = route.matches(this.state.path, this.props.stateProvider)

            if (match) {
                const Component = match.component
                return <Component
                    context={this.props.context}
                    params={match.params}
                    stateProvider={this.props.stateProvider} />
            }
        }

        return null
    }
}

// a state provider is an object that controls
// the URL history. for the browser we will make
// use of the History API.
//
// https://developer.mozilla.org/en-US/docs/Web/API/History_API
export type StateProvider = {
    current(): string
    events: EventEmitter<{ change: [string] }>
    push(path: string): void
}

export class WindowHistoryStateProvider implements StateProvider {
    public readonly events = new EventEmitter<{ change: [string] }>()

    public current(): string {
        return window.location.pathname
    }

    public push(path: string): void {
        // if the user is explicitly requesting the same
        // state that's currently loaded we force a page
        // reload.
        if (path === this.current()) {
            return window.location.reload()
        }
        window.history.pushState({}, '', path)
        this.events.trigger('change', path)
    }
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    activeClass?: string
    activePattern?: RegExp
    path: string
    stateProvider: StateProvider
}

// the link component is a wrapper around the <a>-tag
// that forwards clicks to the state provider. it supports
// all normal anchor-attributes except href and onClick.
export class Link extends React.Component<LinkProps, { current: string }> {
    constructor(props: LinkProps) {
        super(props)

        this.state = {
            current: props.stateProvider.current(),
        }

        this.changeState = this.changeState.bind(this)
    }

    protected changeState(next: string) {
        this.setState({
            current: next,
        })
    }

    public componentDidMount(): void {
        this.props.stateProvider.events.subscribe('change', this.changeState)
    }

    public componentWillUnmount(): void {
        this.props.stateProvider.events.unsubscribe('change', this.changeState)
    }

    public render() {
        const p = assign({}, this.props) as LinkProps
        const clazz = classNames({
            [this.props.className || '']: true,
            [this.props.activeClass || 'active']: this.props.activePattern
                ? this.props.activePattern.test(this.state.current)
                : this.props.path === this.state.current,
        })

        delete p.activeClass
        delete p.activePattern
        delete p.className
        delete p.href
        delete p.onClick
        delete p.path
        delete p.stateProvider

        return (
            <a href={this.props.path}
               className={clazz}
               onClick={event => {
                   event.preventDefault()
                   event.stopPropagation()
                   this.props.stateProvider.push(this.props.path)
               }}
               {...p}>{this.props.children}</a>
        )
    }
}
