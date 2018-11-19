import React from 'react'


class ComponentLibraryItem extends React.Component {
  render () {
    const component = this.props.component
    return (
      <div
        onClick={() => {
          this.props.actions.programEngine.addProcWithComponent({component})
        }}
      >
        <label>{component.label}</label>
      </div>
    )
  }
}

export default ComponentLibraryItem
