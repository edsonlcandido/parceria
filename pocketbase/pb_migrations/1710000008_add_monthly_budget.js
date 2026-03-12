migrate((txApp) => {
  const collection = txApp.findCollectionByNameOrId('transactions')

  collection.fields.add(
    new DateField({
      name: 'monthly_budget',
      required: false,
    })
  )

  return txApp.save(collection)
}, (txApp) => {
  const collection = txApp.findCollectionByNameOrId('transactions')
  const field = collection.fields.getByName('monthly_budget')
  if (field) collection.fields.remove(field)
  return txApp.save(collection)
})
