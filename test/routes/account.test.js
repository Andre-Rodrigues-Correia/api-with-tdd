const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeAll(async () => {
    const res = await app.services.user.save({
        name: 'user Account',
        email: `${Date.now()}@email.com`,
        password: '1234',
    });

    user = { ...res[0] };
    user.token = jwt.encode(user, 'Secret!');

    const res2 = await app.services.user.save({
        name: 'user Account #2',
        email: `${Date.now()}@email.com`,
        password: '1234',
    });

    user2 = { ...res2[0] };
});

beforeEach(async () => {
    await app.db('transactions').del();
    await app.db('accounts').del();
});

test('should insert account with success', () => {
    return request(app).post(MAIN_ROUTE).send({
        name: 'Acc #1',
    }).set('authorization', `bearer ${user.token}`)
    .then((result) => {
        expect(result.status).toEqual(201);
        expect(result.body.name).toEqual('Acc #1');
    });
});

test('should not insert a account without name', () => {
    return request(app).post(MAIN_ROUTE).send({}).set('authorization', `bearer ${user.token}`)
    .then((result) => {
        expect(result.status).toEqual(400);
        expect(result.body.error).toEqual('nome é um atributo obrigatório');
    });
});

test('should not insert account with duplicate name for the same user', () => {
    return app.db('accounts').insert({ name: 'Acc duplicated', user_id: user.id })
        .then(() => request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .send({ name: 'Acc duplicated' })).then((res) => {
            expect(res.status).toEqual(400);
            expect(res.body.error).toEqual('já existe uma conta com esse nome');
        });
});

test('should list account only user', () => {
    return app.db('accounts').insert([
        { name: 'Acc user #1', user_id: user.id },
        { name: 'Acc user #2', user_id: user2.id },
    ]).then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].name).toEqual('Acc user #1');
    }));
});

test('should return a account per id', () => {
    return app.db('accounts').insert({ name: 'Acc by Id', user_id: user.id }, ['id'])
        .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual('Acc by Id');
            expect(res.body.user_id).toEqual(user.id);
        });
});

test('should not return account for other user', () => {
    return app.db('accounts').insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
        .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)).then((res) => {
            expect(res.status).toEqual(403);
            expect(res.body.error).toEqual('este recurso não pertence ao usuário');
        });
});

test('shoult update a account', () => {
    return app.db('accounts').insert({ name: 'Acc to update', user_id: user.id }, ['id'])
        .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
        .send({ name: 'Acc updated' }).set('authorization', `bearer ${user.token}`))
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual('Acc updated');
        });
});

test('should not update account for other user', () => {
    return app.db('accounts').insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
    .send({ name: 'Acc updated' })
    .set('authorization', `bearer ${user.token}`)).then((res) => {
        expect(res.status).toEqual(403);
        expect(res.body.error).toEqual('este recurso não pertence ao usuário');
    });
});

test('should remove a account', () => {
    return app.db('accounts')
    .insert({ name: 'Acc to remove', user_id: user.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
    .set('authorization', `bearer ${user.token}`))
    .then((res) => {
      expect(res.status).toBe(204);
    });
});
test('should not remove account for other user', () => {
    return app.db('accounts').insert({ name: 'Acc User #2', user_id: user2.id }, ['id'])
    .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
    .set('authorization', `bearer ${user.token}`)).then((res) => {
        expect(res.status).toEqual(403);
        expect(res.body.error).toEqual('este recurso não pertence ao usuário');
    });
});
