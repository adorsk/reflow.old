import React from 'react'


class Port extends React.Component {
  constructor (props) {
    super(props)
    this.handleRef = React.createRef()
  }

  render () {
    const { portDef, procId, ioType, value } = this.props
    return (
      <div>
        <span
          ref={this.handleRef}
          data-portid={portDef.id}
          data-procid={procId}
          className='port-handle'
        >
          {(ioType === 'inputs') ? '▶' : '◀'}
        </span>
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

  getHandleEl () { return this.handleRef.current }
}

export default Port
