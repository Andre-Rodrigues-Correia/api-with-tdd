const moment = require('moment');

exports.seed = (knex) => {
    return knex('users').insert([
        {
            id: 100100, name: 'User #3', email: 'user3@mail.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS',
        },
        {
            id: 100101, name: 'User #4', email: 'user4@mail.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS',
        },
        {
            id: 100102, name: 'User #5', email: 'user5@mail.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS',
        },
    ])
        .then(() => knex('accounts').insert([
            { id: 100100, name: 'Acc Saldo Principal', user_id: 100100 },
            { id: 100101, name: 'Acc Saldo Secundário', user_id: 100100 },
            { id: 100102, name: 'Acc Alternativa 1', user_id: 100101 },
            { id: 100103, name: 'Acc Alternativa 2', user_id: 100101 },
            { id: 100104, name: 'Acc Geral Principal', user_id: 100102 },
            { id: 100105, name: 'Acc Geral Secundário', user_id: 100102 },
        ]))
        .then(() => knex('transfers').insert([
            {
                id: 100100, description: 'Transfer #1', user_id: 100102, acc_origin_id: 100105, acc_destiny_id: 100104, ammount: 256, date: new Date(),
            },
            {
                id: 100101, description: 'Transfer #2', user_id: 100101, acc_origin_id: 100102, acc_destiny_id: 100103, ammount: 512, date: new Date(),
            },
        ]))
        .then(() => knex('transactions').insert([
            // Transacao positiva / Saldo = 2
            {
                description: '2', date: new Date(), ammount: 2, type: 'I', acc_id: 100104, status: true,
            },
            // Transacao usuario errado / Saldo = 2
            {
                description: '2', date: new Date(), ammount: 4, type: 'I', acc_id: 100102, status: true,
            },
            // Transacao outra conta / Saldo = 2 / Saldo: 8
            {
                description: '2', date: new Date(), ammount: 8, type: 'I', acc_id: 100105, status: true,
            },
            // Transacao pendente / Saldo = 2 / Saldo: 8
            {
                description: '2', date: new Date(), ammount: 16, type: 'I', acc_id: 100104, status: false,
            },
            // Transacao passada / Saldo = 34 / Saldo: 8
            {
                description: '2', date: moment().subtract({ days: 5 }), ammount: 32, type: 'I', acc_id: 100104, status: true,
            },
            // Transacao futura / Saldo = 34 / Saldo: 8
            {
                description: '2', date: moment().add({ days: 5 }), ammount: 64, type: 'I', acc_id: 100104, status: true,
            },
            // Transacao negativa / Saldo = -94 / Saldo: 8
            {
                description: '2', date: moment(), ammount: -128, type: 'O', acc_id: 100104, status: true,
            },
            // Transf / Saldo = 162 / Saldo: -248
            {
                description: '2', date: moment(), ammount: 256, type: 'I', acc_id: 100104, status: true,
            },
            {
                description: '2', date: moment(), ammount: -256, type: 'O', acc_id: 100105, status: true,
            },
            // Transf / Saldo = 162 / Saldo: -248
            {
                description: '2', date: moment(), ammount: 512, type: 'I', acc_id: 100103, status: true,
            },
            {
                description: '2', date: moment(), ammount: -512, type: 'O', acc_id: 100102, status: true,
            },
        ]));
};
