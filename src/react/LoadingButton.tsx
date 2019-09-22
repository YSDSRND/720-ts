import * as React from 'react'
import {Func1} from "../types"

//
// this component is a wrapper around the <button> element
// that executes an asynchronous action on click and
// automatically disables itself. when the action is complete
// the button is enabled again.
//
// Usage:
//
// <LoadingButton
//   execute={event => {
//     event.preventDefault()
//     return someAsyncAction()
//   }}>
//   My Button
// </LoadingButton>
//
// In some cases you may want the button to disable itself
// in response to an external value (promise). You may then
// provide the "promise"-property to the button. The following
// example will be disabled for 1 second after it renders:
//
// <LoadingButton
//   promise={new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(true)
//     }, 1000)
//   })}
//   execute={event => {
//     event.preventDefault()
//     return someAsyncAction()
//   }}>
//   My Button
// </LoadingButton>
//

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    execute: Func1<React.MouseEvent<HTMLButtonElement>, PromiseLike<unknown>>
    iconClass?: string
    promise?: PromiseLike<unknown>
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
            loading: typeof props.promise !== 'undefined',
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

        if (this.props.promise) {
            this.props.promise.then(this.done, this.done)
        }
    }

    public UNSAFE_componentWillMount(): void {
        this.isComponentMounted = false
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Props): void {
        if (nextProps.promise) {
            this.setState({ loading: true })
            nextProps.promise.then(this.done, this.done)
        }
    }

    public render() {
        const p = {...this.props}

        // this button behaves exactly like a normal button
        // but for we don't want these properties to be output
        // to the DOM.
        delete p.execute
        delete p.onClick
        delete p.disabled
        delete p.iconClass
        delete p.promise

        return (
            <button
                onClick={this.onClick}
                disabled={this.state.loading || this.props.disabled}
                {...p}>
                {this.props.children}
                {this.state.loading
                    ? <span>&nbsp;<i className={p.iconClass || 'fa fa-cog fa-spin'} /></span>
                    : null
                }
            </button>
        )
    }
}
