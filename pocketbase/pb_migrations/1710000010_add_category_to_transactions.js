migrate((txApp) => {
  const collection = txApp.findCollectionByNameOrId('transactions')

  collection.fields.add(
    new SelectField({
      name: 'category',
      required: false,
      maxSelect: 1,
      values: ['regular', 'bill_payment'],
    })
  )

  return txApp.save(collection)
}, (txApp) => {
  const collection = txApp.findCollectionByNameOrId('transactions')
  const field = collection.fields.getByName('category')
  if (field) {
    collection.fields.remove(field)
  }
  return txApp.save(collection)
})
