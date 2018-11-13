class MyComponent {
  async getTickFn () {
    if (! this._tickFnModule) {
      this._tickFnModule = await import('./tickFn.js')
    }
    return this._tickFnModule.default
  }
}

const component = new MyComponent()
export default component
