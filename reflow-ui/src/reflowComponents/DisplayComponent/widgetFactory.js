class DisplayWidget {
  constructor (opts) {
    this.container = opts.container
  }

  update ({proc}) {
    if (!(proc) || !(proc.inputs) || !(proc.inputs.displayFn)) { return }
    try {
      const displayFn = new Function('container', 'IN', proc.inputs.displayFn.data)
      displayFn(this.container, proc.inputs.IN)
    } catch (err) {
      this.container.innerHTML = `Error: ${err}`
    }
  }
}

const widgetFactory = {
  createWidget: (...args) => new DisplayWidget(...args)
}
export default widgetFactory
