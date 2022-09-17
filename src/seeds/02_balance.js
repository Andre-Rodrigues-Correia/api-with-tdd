exports.seed = async (knex) => {
    return knex('users').insert([
        {
            id: 100100, name: 'User #3', email: 'user3@email.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS',
        },
        {
            id: 100101, name: 'User #4', email: 'user4@email.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS',
        },
    ]).then(() => knex('accounts').insert([
        { id: 100100, name: 'Acc Saldo Principal', user_id: 100100 },
        { id: 100101, name: 'Acc Saldo Secundário', user_id: 100100 },
        { id: 100102, name: 'Acc Alternativa 1', user_id: 100101 },
        { id: 100103, name: 'Acc alternativa 2', user_id: 100101 },
    ]));
};
