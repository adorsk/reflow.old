import React from 'react'


class Port extends React.Component {
  constructor (props) {
    super(props)
    this.portRef = React.createRef()
  }

  render () {
    const { portDef, ioType, value } = this.props
    const icon = (ioType === 'input') ? '▶' : '◀'
    return (
      <div>
        <span ref={this.portRef}>
          {icon}
        </span>
        <label>{portDef.id} [value: {JSON.stringify(value)}]</label>
      </div>
    )
  }

  componentDidMount () {
    if (this.props.afterMount) { this.props.afterMount(this) }
  }

  componentWillUnmount () {
    if (this.props.beforeUnmount) { this.props.beforeUnmount(this) }
  }

  getPosition () {
    const boundingRect = this.portRef.current.getBoundingClientRect()
    return {
      x: boundingRect.left + window.pageXOffset,
      y: boundingRect.top + window.pageYOffset,
    }
  }
}

export default Port
