module.exports = {
  name: 'reports',
  fields: [
    {
      name: 'reporter',
      type: 'String',
      length: '50',
      not_null: true
    },
    {
      name: 'topic',
      type: 'Number',
      not_null: true
    },
    {
      name: 'value',
      type: 'String',
      length: 256,
      not_null: true
    }
  ]
}