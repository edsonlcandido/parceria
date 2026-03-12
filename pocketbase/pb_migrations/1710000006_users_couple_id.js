migrate((txApp) => {
  const couples = txApp.findCollectionByNameOrId('couples')
  const users = txApp.findCollectionByNameOrId('users')

  users.fields.add(
    new EmailField({ name: 'email', required: false }),
    new RelationField({
      name: 'couple_id',
      collectionId: couples.id,
      maxSelect: 1,
      cascadeDelete: true,
    })
  )

  users.listRule = ''
  users.viewRule = ''
  users.createRule = ''
  users.updateRule = ''
  users.deleteRule = ''

  txApp.save(users)
}, (txApp) => {
  const users = txApp.findCollectionByNameOrId('users')

  users.fields.add(
    new EmailField({ name: 'email', required: true })
  )
  users.fields.removeByName('couple_id')

  users.listRule = null
  users.viewRule = null
  users.createRule = null
  users.updateRule = null
  users.deleteRule = null

  txApp.save(users)
})
