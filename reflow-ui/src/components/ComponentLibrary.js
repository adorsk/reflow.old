import React from 'react'

import ComponentLibraryItem from './ComponentLibraryItem.js'

class ComponentLibrary extends React.Component {
  render () {
    return (
      <div>
        ComponentLibrary
        {this._renderComponentLibraryItems()}
      </div>
    )
  }

  _renderComponentLibraryItems () {
    const fakeComponents = [1,2,3].map((i) => {
      return {
        id: i,
        label: `component-${i}`,
      }
    })
    const components = fakeComponents
    return components.map((component) => this._renderComponentLibraryItem({component}))
  }

  _renderComponentLibraryItem ({component}) {
    return (
      <ComponentLibraryItem
        key={component.id}
        component={component}
        actions={this.props.actions}
      />
    )
  }
}

export default ComponentLibrary
