class DisplayComponent {
  constructor () {
    this.id = this.label = 'Display'
    this._widgetFactory = null
    this.ports = {
      inputs: [
        {id: 'IN'},
        {id: 'displayFn'},
      ]
    }
  }

  async createWidget (...args) {
    if (! this._widgetFactory) {
      const widgetFactoryModule = await import('./widgetFactory.js')
      this._widgetFactory = widgetFactoryModule.default
    }
    return this._widgetFactory.createWidget(...args)
  }
}

const component = new DisplayComponent()
export default component
