exports.seed = (knex) => {
  // Deletes ALL existing entries
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('accounts').del())
    .then(() => knex('users').del())
    .then(() => knex('users').insert([
        {
          id: 100000, name: 'User #1', email: 'user1@email.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS',
        },
        {
          id: 100001, name: 'User #2', email: 'user2@email.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS',
        },
    ]))
    .then(() => knex('accounts').insert([
        { id: 100000, name: 'AccO #1', user_id: 100000 },
        { id: 100001, name: 'AccD #1', user_id: 100000 },
        { id: 100002, name: 'AccO #2', user_id: 100001 },
        { id: 100003, name: 'AccD #2', user_id: 100001 },
    ]))
    .then(() => knex('transfers').insert([
        {
          id: 100000, description: 'transfer #1', user_id: 100000, acc_origin_id: 100000, acc_destiny_id: 100001, ammount: 100, date: new Date(),
        },
        {
          id: 100001, description: 'transfer #2', user_id: 100001, acc_origin_id: 100002, acc_destiny_id: 100003, ammount: 100, date: new Date(),
        },
    ]))
    .then(() => knex('transactions').insert([
        {
          description: 'transfer from AccO #1', date: new Date(), ammount: 100, type: 'I', acc_id: 100001, transfer_id: 100000,
        },
        {
          description: 'transfer from AccD #1', date: new Date(), ammount: -100, type: 'O', acc_id: 100000, transfer_id: 100000,
        },
        {
          description: 'transfer from AccO #2', date: new Date(), ammount: 100, type: 'I', acc_id: 100003, transfer_id: 100001,
        },
        {
          description: 'transfer from AccD #2', date: new Date(), ammount: -100, type: 'O', acc_id: 100002, transfer_id: 100001,
        },
    ]));
};
