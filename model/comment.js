module.exports = {
  name: 'comments',
  fields: [
    {
      name: 'id',
      type: 'Number',
      not_null: true,
      primary_key: true
    },
    {
      name: 'tid',
      type: 'String',
      length: 64,
      not_null: true,
      unique: true
    },
    {
      name: 'authorId',
      type: 'String',
      length: 50,
      not_null: true
    },
    {
      name: 'aid',
      type: 'Number',
      not_null: true,
      index: true,
    },
    {
      name: 'pid',
      type: 'Number',
      index: true,
    },
    {
      name: 'content',
      type: 'String',
      length: 4096,
      not_null: true,
    },
    {
      name: 'rewards',
      type: 'Number',
      not_null: true
    },
    {
      name: 'reports',
      type: 'Number',
      not_null: true,
      default: 0
    }
  ]
}