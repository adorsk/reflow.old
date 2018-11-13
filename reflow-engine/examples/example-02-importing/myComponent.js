class MyComponent {
  async loadTickFn () {
    const module = await import('./tickFn.js')
    this.tickFn = module.default
  }
}

const component = new MyComponent()
export default component
