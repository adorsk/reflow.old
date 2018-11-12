class Resolver {
  resolve ({spec}) {
    if (spec.type === 'inline') { return spec.value }
    throw new Error(`Could not resolve spec. spec was: '${spec}'`)
  }
}

export default Resolver
