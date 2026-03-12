migrate((txApp) => {
  const collection = txApp.findCollectionByNameOrId('transactions')
  const field = collection.fields.getByName('account_id')
  if (field) {
    field.required = false
    field.minSelect = 0
  }
  return txApp.save(collection)
}, (txApp) => {
  const collection = txApp.findCollectionByNameOrId('transactions')
  const field = collection.fields.getByName('account_id')
  if (field) {
    field.required = true
    field.minSelect = 1
  }
  return txApp.save(collection)
})
