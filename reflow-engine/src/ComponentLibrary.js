class ComponentLibrary {
  constructor () {
    this._components = {}
  }
  get ({key}) { return this._components[key] }
  set ({key, value}) { this._components[key] = value }
  del ({key}) { delete this._components[key] }
  update ({updates}) { Object.assign(this._components, updates) }
  getComponents () { return this._components }
}

export default ComponentLibrary
