class LoggerWidget {
  constructor (opts) {
    this.container = opts.container
    this.state = { proc: {} }
  }

  update ({proc}) {
    this.state = {...this.state, proc}
    this.render()
  }

  render () {
    let inputs = this.state.proc.inputs
    this.container.innerHTML = (
      `
       inputs:
       <code>${JSON.stringify(inputs, null, 2)}</code>
      `
    )
  }
}


class WidgetFactory {
  createWidget ({container}) {
    return new LoggerWidget({
      container,
    })
  }
}

const widgetFactory = new WidgetFactory()
export default widgetFactory
