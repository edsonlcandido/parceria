migrate((txApp) => {
  const couplesCollection = txApp.findCollectionByNameOrId('couples')
  const accountsCollection = txApp.findCollectionByNameOrId('accounts')

  const collection = new Collection({
    name: 'transactions',
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
      name: 'account_id',
      required: true,
      collectionId: accountsCollection.id,
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
    new NumberField({
      name: 'amount',
      required: true,
      min: 0,
    }),
    new TextField({
      name: 'description',
    }),
    new SelectField({
      name: 'type',
      required: true,
      maxSelect: 1,
      values: ['income', 'expense'],
    }),
    new DateField({
      name: 'date',
      required: true,
    }),
    new BoolField({
      name: 'consolidated',
    })
  )

  return txApp.save(collection)
}, (txApp) => {
  const collection = txApp.findCollectionByNameOrId('transactions')
  return txApp.delete(collection)
})
