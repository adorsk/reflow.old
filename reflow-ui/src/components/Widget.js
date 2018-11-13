import React from 'react'


class Widget extends React.Component {
  render () {
    const proc = this.props.proc
    return (
      <div>
        widget!
        <div>
          <label>state</label>
          <code>
            {JSON.stringify(proc.state, null, 2)}
          </code>
        </div>
      </div>
    )
  }
}

export default Widget
