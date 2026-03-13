migrate((txApp) => {
  const couples = txApp.findCollectionByNameOrId('couples')
  const accounts = txApp.findCollectionByNameOrId('accounts')
  const transactions = txApp.findCollectionByNameOrId('transactions')

  couples.fields.add(
    new TextField({ name: 'name' }),
    new TextField({ name: 'access_token', required: true, min: 16, max: 64 }),
    new TextField({ name: 'partner1_name' }),
    new TextField({ name: 'partner2_name' })
  )

  couples.indexes = ['CREATE UNIQUE INDEX idx_couples_access_token ON couples (access_token)']

  accounts.fields.add(
    new RelationField({
      name: 'couple_id',
      required: true,
      collectionId: couples.id,
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

  transactions.fields.add(
    new RelationField({
      name: 'couple_id',
      required: true,
      collectionId: couples.id,
      minSelect: 1,
      maxSelect: 1,
      cascadeDelete: true,
    }),
    new RelationField({
      name: 'account_id',
      required: true,
      collectionId: accounts.id,
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

  txApp.save(couples)
  txApp.save(accounts)
  txApp.save(transactions)
}, (txApp) => {
  const couples = txApp.findCollectionByNameOrId('couples')
  const accounts = txApp.findCollectionByNameOrId('accounts')
  const transactions = txApp.findCollectionByNameOrId('transactions')

  couples.fields.removeByName('name')
  couples.fields.removeByName('access_token')
  couples.fields.removeByName('partner1_name')
  couples.fields.removeByName('partner2_name')
  couples.indexes = []

  accounts.fields.removeByName('couple_id')
  accounts.fields.removeByName('owner_slot')
  accounts.fields.removeByName('name')
  accounts.fields.removeByName('type')

  transactions.fields.removeByName('couple_id')
  transactions.fields.removeByName('account_id')
  transactions.fields.removeByName('owner_slot')
  transactions.fields.removeByName('amount')
  transactions.fields.removeByName('description')
  transactions.fields.removeByName('type')
  transactions.fields.removeByName('date')
  transactions.fields.removeByName('consolidated')

  txApp.save(couples)
  txApp.save(accounts)
  txApp.save(transactions)
})
