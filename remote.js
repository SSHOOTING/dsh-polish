// DSH Remote descriptor for the dsh-polish host service.
const json = Object.freeze({
  parse(value) {
    return value
  },
})

const descriptor = (method) => ({
  id: `dsh-polish/remote#dshPolish/${method}`,
  service: 'dshPolish',
  namespace: 'dshPolish',
  method,
  invocation: { kind: 'direct' },
  parameters: [{
    name: 'request',
    wire: 'request',
    source: 'json',
    codec: {
      mode: 'strict',
      typeSymbol: 'dsh-polish#JsonRequest',
      schema: json,
      create: () => json,
    },
  }],
  result: {
    mode: 'strict',
    typeSymbol: 'dsh-polish#JsonResult',
    schema: json,
    create: () => json,
  },
})

export default Object.freeze({
  package: 'dsh-polish',
  descriptors: Object.freeze([descriptor('polish')]),
})
