class TextInputWidget {
  constructor (opts) {
    this.container = opts.container
    this.input = this._createInput()
    this.container.appendChild(this.input)
    this.input.addEventListener('change', (e) => opts.onChange(e.target.value))
  }

  _createInput () {
    const input = document.createElement('input')
    input.type = 'text'
    return input
  }
}


class WidgetFactory {
  createWidget ({container, updateProcOutputs}) {
    return new TextInputWidget({
      container,
      onChange: (value) => {
        updateProcOutputs({
          updates: {OUT: { packet: {data: value}}}
        })
      }
    })
  }
}

const widgetFactory = new WidgetFactory()
export default widgetFactory
