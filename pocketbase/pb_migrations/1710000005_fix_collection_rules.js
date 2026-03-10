migrate((txApp) => {
  const names = ['couples', 'accounts', 'transactions']

  for (const name of names) {
    const collection = txApp.findCollectionByNameOrId(name)
    collection.listRule = ''
    collection.viewRule = ''
    collection.createRule = ''
    collection.updateRule = ''
    collection.deleteRule = ''
    txApp.save(collection)
  }
}, (txApp) => {
  // Revert is not safe — leave as-is
})
