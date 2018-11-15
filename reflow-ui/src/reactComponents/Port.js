import React from 'react'


class Port extends React.Component {
  constructor (props) {
    super(props)
    this.portRef = React.createRef()
  }

  render () {
    const { portDef, ioType, value } = this.props
    const icon = (ioType === 'inputs') ? '▶' : '◀'
    return (
      <div>
        <span ref={this.portRef}>{icon}</span>
        <label>
          <span title={JSON.stringify(value)}>
            {portDef.label || portDef.id}
          </span>
        </label>
      </div>
    )
  }

  componentDidMount () {
    if (this.props.afterMount) { this.props.afterMount(this) }
  }

  componentWillUnmount () {
    if (this.props.beforeUnmount) { this.props.beforeUnmount(this) }
  }

  getBoundingRect () {
    return this.portRef.current.getBoundingClientRect()
  }
}

export default Port
