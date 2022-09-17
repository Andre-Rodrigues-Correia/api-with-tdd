const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';
let user;
let user2;
let accUser;
let accUser2;

beforeAll(async () => {
    await app.db('transactions').del();
    await app.db('transfers').del();
    await app.db('accounts').del();
    await app.db('users').del();

    const users = await app.db('users').insert([
        { name: 'user #1', email: 'user@email.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS' },
        { name: 'user #2', email: 'user2@email.com', password: '$2a$10$TfqfanVCt02ksyUebnmUbuE4u2rbUp2yxLxFfOw3f2IsFXoiyJlpS' },
    ], '*');

    [user, user2] = users;
    delete user.password;
    user.token = jwt.encode(user, 'Secret!');

    const accs = await app.db('accounts').insert([
        { name: 'Acc #1', user_id: user.id },
        { name: 'Acc #2', user_id: user2.id },
    ], '*');

    [accUser, accUser2] = accs;
});
test('should list only user transactinos', () => {
    return app.db('transactions').insert([
        {
            description: 'D1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id,
        },
        {
            description: 'D2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id,
        },
    ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].description).toEqual('D1');
    }));
});

test('should insert a transaction with sucess', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({
            description: 'new description', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id,
        })
        .then((res) => {
            expect(res.status).toEqual(201);
            expect(res.body.acc_id).toEqual(accUser.id);
            expect(res.body.ammount).toEqual('100.00');
    });
});

test('should have positive values in input transactions', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({
            description: 'new description', date: new Date(), ammount: -100, type: 'I', acc_id: accUser.id,
        })
        .then((res) => {
            expect(res.status).toEqual(201);
            expect(res.body.acc_id).toEqual(accUser.id);
            expect(res.body.ammount).toEqual('100.00');
    });
});

test('should have negative values in output transactions', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({
            description: 'new description', date: new Date(), ammount: 100, type: 'O', acc_id: accUser.id,
        })
        .then((res) => {
            expect(res.status).toEqual(201);
            expect(res.body.acc_id).toEqual(accUser.id);
            expect(res.body.ammount).toEqual('-100.00');
    });
});

describe('should not insert valid transaction', () => {
    let validTransaction;
    beforeAll(() => {
        validTransaction = {
            description: 'new description', date: new Date(), ammount: -100, type: 'I', acc_id: accUser.id,
        };
    });

    const testTemplate = (newData, errorMessage) => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .send({ ...validTransaction, ...newData })
            .then((res) => {
                expect(res.status).toEqual(400);
                expect(res.body.error).toEqual(errorMessage);
        });
    };

    test('should not insert a transaction without description', () => testTemplate({ description: null }, 'descrição é um atributo obrigatório'));

    test('should not insert a transaction without value', () => testTemplate({ ammount: null }, 'valor é um atributo obrigatório'));

    test('should not insert a transaction without date', () => testTemplate({ date: null }, 'data é um atributo obrigatório'));

    test('should not insert a transaction without account', () => testTemplate({ acc_id: null }, 'conta é um atributo obrigatório'));

    test('should not insert a transaction without type', () => testTemplate({ type: null }, 'tipo é um atributo obrigatório'));

    test('should not insert a transaction without invalid type', () => testTemplate({ type: 'A' }, 'tipo inválido'));
});

test('should retun a transaction per id', () => {
    return app.db('transactions').insert({
        description: 'D ID', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id,
    }, ['id']).then((trans) => request(app).get(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.id).toEqual(trans[0].id);
            expect(res.body.description).toEqual('D ID');
    }));
});

test('should update a transaction', () => {
    return app.db('transactions').insert({
        description: 'to update', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id,
    }, ['id']).then((trans) => request(app).put(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .send({ description: 'updated' })
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.description).toEqual('updated');
    }));
});

test('should remove a transaction', () => {
    return app.db('transactions').insert({
        description: 'to delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id,
    }, ['id']).then((trans) => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toEqual(204);
    }));
});

test('should not remove transaction from other user', () => {
    return app.db('transactions').insert({
        description: 'to delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser2.id,
    }, ['id']).then((trans) => request(app).delete(`${MAIN_ROUTE}/${trans[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toEqual(403);
            expect(res.body.error).toEqual('este recurso não pertence ao usuário');
    }));
});

test('should not delete account with trasaction', () => {
    return app.db('transactions').insert({
        description: 'to delete', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id,
    }, ['id']).then(() => request(app).delete(`/v1/accounts/${accUser.id}`)
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toEqual(400);
            expect(res.body.error).toEqual('essa conta possui transações associadas');
    }));
});
