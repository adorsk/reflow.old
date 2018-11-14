class TextAreaComponent {
  constructor () {
    this.id = this.label = 'TextArea'
    this._widgetFactory = null
    this.ports = {
      outputs: [
        {id: 'OUT', label: 'OUT'}
      ],
    }
  }

  async createWidget (...args) {
    if (! this._widgetClass) {
      class TextAreaWidget {
        constructor (opts) {
          const { container, updateProcOutputs } = opts
          this.input = document.createElement('textarea')
          container.appendChild(this.input)
          this.input.addEventListener('change', () => {
            updateProcOutputs({
              updates: {OUT: {data: this.input.value}}
            })
          })
        }
      }
      this._widgetClass = TextAreaWidget
    }
    return new this._widgetClass(...args)
  }
}

const component = new TextAreaComponent()
export default component
