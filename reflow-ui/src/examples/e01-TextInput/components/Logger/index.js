class LoggerComponent {
  constructor () {
    this._widgetFactoryPromise = null
    this.ports = {
      inputs: [
        {id: 'IN'}
      ]
    }
  }

  async createWidget (...args) {
    const widgetFactory = await this._getWidgetFactory()
    return widgetFactory.createWidget(...args)
  }

  async _getWidgetFactory () {
    if (! this._widgetFactoryModule) {
      this._widgetFactoryModule = await import('./widgetFactory.js')
    }
    return this._widgetFactoryModule.default
  }

}

const loggerComponent = new LoggerComponent()
export default loggerComponent
