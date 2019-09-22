import * as React from 'react'
import {classNames} from "../classNames"
import {toArray} from "../toArray"

interface Props {
    className?: string
    disabled?: boolean
    multiple?: boolean
    iconClass?: string
    upload: (files: ReadonlyArray<File>) => PromiseLike<unknown>
}

interface State {
    loading: boolean
}

export class LoadingFileButton extends React.Component<Props, State> {
    // "isMounted" is already used by React but we
    // can't access it from here apparently.
    private isComponentMounted: boolean = false
    private readonly inputRef = React.createRef<HTMLInputElement>()

    constructor(props: Props, context: {}) {
        super(props, context)

        this.onChange = this.onChange.bind(this)
        this.done = this.done.bind(this)

        this.state = {
            loading: false,
        }
    }

    protected done(): void {
        if (!this.isComponentMounted) {
            return
        }
        this.setState({loading: false})
    }

    protected onChange(event: React.FormEvent<HTMLInputElement>) {
        event.preventDefault()
        this.setState({loading: true})

        const element = event.target as HTMLInputElement
        const files = element.files

        if (files) {
            const arrayed = toArray(files)
            this.props.upload(arrayed).then(this.done, this.done)
        }

        // this is a weird hack to reset the file list that
        // the input field caches when you select a file.
        // cross browser compatibility is not great on older
        // browsers because it seems file inputs were not
        // designed to be used by asynchronous code in the
        // first place.
        //
        // https://stackoverflow.com/questions/20549241/how-to-reset-input-type-file
        this.inputRef.current!.value = ''
    }

    public componentDidMount(): void {
        this.isComponentMounted = true
    }

    public componentWillUnmount(): void {
        this.isComponentMounted = false
    }

    public render() {
        const isDisabled = this.state.loading || this.props.disabled === true
        const clazz = classNames({
            [this.props.className || '']: true,
            disabled: isDisabled,
        })
        return <label
            className={clazz}
            role="button">
            {this.props.children}
            {this.state.loading
                ? <span>&nbsp;<i className={this.props.iconClass || 'fa fa-cog fa-spin'}/></span>
                : null}
            <input
                ref={this.inputRef}
                type="file"
                onChange={this.onChange}
                hidden={true}
                multiple={this.props.multiple === true}
                disabled={isDisabled}
                value={''} />
        </label>
    }
}
