class DisplayWidget {
  constructor (opts) {
    this.container = opts.container
  }

  update ({proc}) {
    console.log('update')
    if (!(proc) || !(proc.inputs) || !(proc.inputs.displayFn)) { return }
    const displayFn = new Function('container', 'IN', proc.inputs.displayFn)
    displayFn(this.container, proc.inputs.IN)
  }
}

const widgetFactory = {
  createWidget: (...args) => new DisplayWidget(...args)
}
export default widgetFactory
