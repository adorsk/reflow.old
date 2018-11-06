class Noop {
  tick () { return }
}

export default {
  getInstance: () => new Noop()
}
