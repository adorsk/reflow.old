class Resolver {
  async resolve ({spec}) {
    if (spec.type === 'inline') { return spec.value }
    if (spec.type === 'import') { return this.resolveImportSpec({spec}) }
    if (spec.type === 'fn') { return spec.fn() }
    throw new Error(`Could not resolve spec. spec was: '${spec}'`)
  }

  async resolveImportSpec ({spec}) {
    const importSpecParts = spec.importSpec.split(':')
    if (importSpecParts.length == 1) { importSpecParts.push(['default']) }
    const [ moduleSpec, member ] = importSpecParts
    const module = await import(moduleSpec)
    if (!(member in module)) {
      throw new Error(
        'ImportError: could not find member '
        + `'${member}' in module ${moduleSpec}.`
      )
    }
    return module[targetMember]
  }
}

export default Resolver
