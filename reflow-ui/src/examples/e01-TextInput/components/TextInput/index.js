class TextInputComponent {
  constructor () {
    this._widgetFactoryPromise = null
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

const textInputComponent = new TextInputComponent()
export default textInputComponent
