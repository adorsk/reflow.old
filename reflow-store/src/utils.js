export const getWireId = (wire) => {
  const { src, dest } = wire
  return `${src.procId}:${src.portId} -> ${dest.procId}:${dest.portId}`
}
