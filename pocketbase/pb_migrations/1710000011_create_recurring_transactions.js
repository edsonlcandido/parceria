migrate((txApp) => {
  const couplesCollection = txApp.findCollectionByNameOrId('couples')
  const usersCollection = txApp.findCollectionByNameOrId('users')

  const collection = new Collection({
    name: 'recurring_transactions',
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
    new RelationField({
      name: 'user_id',
      collectionId: usersCollection.id,
      maxSelect: 1,
    }),
    new TextField({
      name: 'description',
      required: true,
      min: 1,
    }),
    new NumberField({
      name: 'amount',
      required: true,
      min: 0,
    }),
    new SelectField({
      name: 'type',
      required: true,
      maxSelect: 1,
      values: ['income', 'expense'],
    }),
    new NumberField({
      name: 'day',
      required: true,
      min: 1,
      max: 31,
    })
  )

  return txApp.save(collection)
}, (txApp) => {
  const collection = txApp.findCollectionByNameOrId('recurring_transactions')
  return txApp.delete(collection)
})
