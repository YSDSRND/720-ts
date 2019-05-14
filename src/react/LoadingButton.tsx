import * as React from 'react'
import {assign} from "../assign";
import {Func1} from "../types";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    execute: Func1<React.MouseEvent<HTMLButtonElement>, PromiseLike<unknown>>
    iconClass?: string
}

interface State {
    loading: boolean
}

export class LoadingButton extends React.Component<Props, State> {

    // "isMounted" is already used by React but we
    // can't access it from here apparently.
    private isComponentMounted: boolean = false

    constructor(props: Props, context: {}) {
        super(props, context)

        this.state = {
            loading: false,
        }

        this.done = this.done.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    protected done(): void {
        if (!this.isComponentMounted) {
            return
        }
        this.setState({ loading: false })
    }

    protected onClick(event: React.MouseEvent<HTMLButtonElement>) {
        if (this.props.onClick) {
            this.props.onClick(event)
        }
        this.setState({ loading: true })
        this.props.execute(event).then(this.done, this.done)
    }

    public componentDidMount(): void {
        this.isComponentMounted = true
    }

    public componentWillUnmount(): void {
        this.isComponentMounted = false
    }

    public render() {
        const p = assign<Props>({}, this.props)

        // this button behaves exactly like a normal button
        // but for we don't want these properties to be output
        // to the DOM.
        delete p.execute
        delete p.onClick
        delete p.disabled
        delete p.iconClass

        return <button
            onClick={this.onClick}
            disabled={this.state.loading || this.props.disabled}
            {...p}>
            {this.props.children}
            {this.state.loading
                ? <span>&nbsp;<i className={p.iconClass || 'fa fa-cog fa-spin'} /></span>
                : null
            }
        </button>
    }
}
