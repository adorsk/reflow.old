class Resolver {
  async resolve ({spec}) {
    if (spec.type === 'inline') { return spec.value }
    if (spec.type === 'fn') { return spec.fn() }
    throw new Error(`Could not resolve spec. spec was: '${spec}'`)
  }
}

export default Resolver
