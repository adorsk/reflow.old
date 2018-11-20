import React from 'react'
import _ from 'lodash'

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
    // ick. refactor this.
    const componentLibrary = _.get(
      this.props.componentLibrary, 'componentLibrary')
    if (!componentLibrary || !componentLibrary.getComponents) { return }
    const components = componentLibrary.getComponents()
    return _.map(components, (component) => this._renderComponentLibraryItem({component}))
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
