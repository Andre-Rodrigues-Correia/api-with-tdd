const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const email = `${Date.now()}@email.com`;
let user;

beforeAll(async () => {
    const res = await app.services.user.save({
        name: 'user Account',
        email: `${Date.now()}@email.com`,
        password: '1234',
    });

    user = { ...res[0] };
    user.token = jwt.encode(user, 'Secret!');
});

test('should list all users', () => {
    return request(app).get('/users').set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toEqual(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
});

test('shoul insert user with success', () => {
    return request(app).post('/users').send({
            name: 'Matheus Mitty',
            email,
            password: '1234',
        }).set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toEqual(201);
            expect(res.body.name).toEqual('Matheus Mitty');
            expect(res.body).not.toHaveProperty('password');
        });
});

test('shuold save encrypted password', async () => {
    const res = await request(app).post('/users')
        .send({
            name: 'Matheus Mitty',
            email: `${Date.now()}@email.com`,
            password: '1234',
            }).set('authorization', `bearer ${user.token}`);
        expect(res.status).toEqual(201);

        const { id } = res.body;
        const usrDB = await app.services.user.findOne({ id });

        expect(usrDB.password).not.toBeUndefined();
        expect(usrDB.password).not.toEqual('1234');
});

test('should not isert user unnamed', () => {
    return request(app).post('/users').send({
        email: 'matheus@email.com',
        password: '1234',
    }).set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('nome é um atributo obrigatório');
    });
});

test('should not insert user without e-mail', async () => {
    const result = await request(app).post('/users').send({
        name: 'Matheus Mitty',
        password: '1234',
    }).set('authorization', `bearer ${user.token}`);
    expect(result.status).toEqual(400);
    expect(result.body.error).toEqual('e-mail é um atributo obrigatório');
});

test('should not insert user without password', (done) => {
    request(app).post('/users').send({
        name: 'Matheus Mitty',
        email: 'matheus@email.com',
    }).set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('senha é um atributo obrigatório');
        done();
    })
    .catch((error) => done.fail(error));
});

test('should not insert user with existis e-mail', () => {
    return request(app).post('/users').send({
        name: 'Matheus Mitty',
        email,
        password: '1234',
    }).set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('já existe um usuário com esse e-mail');
    });
});
