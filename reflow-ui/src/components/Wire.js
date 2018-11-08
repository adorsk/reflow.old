import React from 'react'

const BEZIER_OFFSET = 50

class Wire extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      srcPosition: null,
      destPosition: null,
    }
  }

  render () {
    return (
      <path
        d={this.positionsToD()}
        fill='none'
        strokeWidth={1}
        stroke={'blue'}
      />
    )
  }

  positionsToD () {
    const src = this.state.srcPosition
    const dest = this.state.destPosition
    if (! src || ! dest) { return null }
    const dParts = [
      'M', [src.x, src.y].join(','),
      'C',
      [src.x + BEZIER_OFFSET, src.y + BEZIER_OFFSET].join(','),
      [dest.x - BEZIER_OFFSET, dest.y].join(','),
      [dest.x, dest.y].join(',')
    ]
    return dParts.join(' ')
  }

  componentDidMount () {
    if (this.props.afterMount) { this.props.afterMount(this) }
  }

  componentWillUnmount () {
    if (this.props.beforeUnmount) {this.props.beforeUnmount(this)}
  }

  setPositions ({src, dest}) {
    this.setState({srcPosition: src, destPosition: dest})
  }
}

export default Wire
