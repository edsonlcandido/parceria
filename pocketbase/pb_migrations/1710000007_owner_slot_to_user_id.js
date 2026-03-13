migrate((txApp) => {
  const users = txApp.findCollectionByNameOrId('users')
  const couples = txApp.findCollectionByNameOrId('couples')
  const accounts = txApp.findCollectionByNameOrId('accounts')
  const transactions = txApp.findCollectionByNameOrId('transactions')

  const p1 = couples.fields.getByName('partner1_name')
  if (p1) couples.fields.removeById(p1.id)
  const p2 = couples.fields.getByName('partner2_name')
  if (p2) couples.fields.removeById(p2.id)
  txApp.save(couples)

  const accOwner = accounts.fields.getByName('owner_slot')
  if (accOwner) accounts.fields.removeById(accOwner.id)
  if (!accounts.fields.getByName('user_id')) {
    accounts.fields.add(
      new RelationField({
        name: 'user_id',
        collectionId: users.id,
        maxSelect: 1,
      })
    )
  }
  txApp.save(accounts)

  const txOwner = transactions.fields.getByName('owner_slot')
  if (txOwner) transactions.fields.removeById(txOwner.id)
  if (!transactions.fields.getByName('user_id')) {
    transactions.fields.add(
      new RelationField({
        name: 'user_id',
        collectionId: users.id,
        maxSelect: 1,
      })
    )
  }
  txApp.save(transactions)
}, (txApp) => {
  const couples = txApp.findCollectionByNameOrId('couples')
  const accounts = txApp.findCollectionByNameOrId('accounts')
  const transactions = txApp.findCollectionByNameOrId('transactions')

  if (!couples.fields.getByName('partner1_name')) {
    couples.fields.add(new TextField({ name: 'partner1_name' }))
  }
  if (!couples.fields.getByName('partner2_name')) {
    couples.fields.add(new TextField({ name: 'partner2_name' }))
  }
  txApp.save(couples)

  const accUserId = accounts.fields.getByName('user_id')
  if (accUserId) accounts.fields.removeById(accUserId.id)
  if (!accounts.fields.getByName('owner_slot')) {
    accounts.fields.add(
      new SelectField({
        name: 'owner_slot',
        required: true,
        maxSelect: 1,
        values: ['casal', 'usuario_1', 'usuario_2'],
      })
    )
  }
  txApp.save(accounts)

  const txUserId = transactions.fields.getByName('user_id')
  if (txUserId) transactions.fields.removeById(txUserId.id)
  if (!transactions.fields.getByName('owner_slot')) {
    transactions.fields.add(
      new SelectField({
        name: 'owner_slot',
        required: true,
        maxSelect: 1,
        values: ['casal', 'usuario_1', 'usuario_2'],
      })
    )
  }
  txApp.save(transactions)
})
