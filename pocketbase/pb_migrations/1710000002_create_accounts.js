migrate((txApp) => {
  const couplesCollection = txApp.findCollectionByNameOrId('couples')

  const collection = new Collection({
    name: 'accounts',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
  })

  collection.fields.add(
    new RelationField({
      name: 'couple_id',
      required: true,
      collectionId: couplesCollection.id,
      minSelect: 1,
      maxSelect: 1,
      cascadeDelete: true,
    }),
    new SelectField({
      name: 'owner_slot',
      required: true,
      maxSelect: 1,
      values: ['casal', 'usuario_1', 'usuario_2'],
    }),
    new TextField({
      name: 'name',
      required: true,
      min: 1,
    }),
    new SelectField({
      name: 'type',
      required: true,
      maxSelect: 1,
      values: ['conta', 'cartao'],
    })
  )

  return txApp.save(collection)
}, (txApp) => {
  const collection = txApp.findCollectionByNameOrId('accounts')
  return txApp.delete(collection)
})
