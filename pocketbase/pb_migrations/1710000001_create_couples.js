migrate((txApp) => {
  const collection = new Collection({
    name: 'couples',
    type: 'base',
    indexes: ['CREATE UNIQUE INDEX idx_couples_access_token ON couples (access_token)'],
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
  })

  collection.fields.add(
    new TextField({
      name: 'name',
    }),
    new TextField({
      name: 'access_token',
      required: true,
      min: 16,
      max: 64,
    }),
    new TextField({
      name: 'partner1_name',
    }),
    new TextField({
      name: 'partner2_name',
    })
  )

  return txApp.save(collection)
}, (txApp) => {
  const collection = txApp.findCollectionByNameOrId('couples')
  return txApp.delete(collection)
})
