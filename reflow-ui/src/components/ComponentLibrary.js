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
    const components = _.get(this.props.componentLibrary, 'components', [])
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
