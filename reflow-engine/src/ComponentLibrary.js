class ComponentLibrary {
  constructor () {
    this._components = {}
  }
  get ({key}) { return this._components[key] }
  set ({key, value}) { this._components[key] = value }
  del ({key}) { delete this._components[key] }
}

export default ComponentLibrary
