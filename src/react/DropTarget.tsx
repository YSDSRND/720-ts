import * as React from 'react'

type DropEffect = 'copy' | 'link' | 'move' | 'none'
type Props = {
    dropEffect?: DropEffect
    onDrop: React.DragEventHandler<HTMLDivElement>
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'>

let didDisableFullscreenDrop = false

function stop(event: Event) {
    event.preventDefault()
    event.stopPropagation()
}

export class DropTarget extends React.Component<Props, {}> {
    public componentDidMount(): void {
        // chrome (and maybe other browsers) has a built-in
        // drop handler for the full screen that attempts to
        // open the dropped object in the browser. we don't
        // want that.
        if (!didDisableFullscreenDrop) {
            window.addEventListener('dragover', stop)
            window.addEventListener('drop', stop)
            didDisableFullscreenDrop = true
        }
    }

    public UNSAFE_componentWillMount(): void {
        if (didDisableFullscreenDrop) {
            window.removeEventListener('dragover', stop)
            window.removeEventListener('drop', stop)
            didDisableFullscreenDrop = false
        }
    }

    protected readonly onDragOver: React.DragEventHandler<HTMLDivElement> = event => {
        event.preventDefault()
        event.dataTransfer.dropEffect = this.props.dropEffect || 'copy'
    }

    protected readonly onDrop: React.DragEventHandler<HTMLDivElement> = event => {
        event.preventDefault()

        this.props.onDrop(event)
    }

    public render() {
        const props: Partial<Props> = {...this.props}
        delete props.dropEffect
        delete props.onDrop

        return (
            <div {...props}
                 onDragOver={this.onDragOver}
                 onDrop={this.onDrop}>
                {this.props.children}
            </div>
        )
    }
}
