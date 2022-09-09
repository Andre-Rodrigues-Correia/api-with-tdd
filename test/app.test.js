const request = require('supertest');

const app = require('../src/app');

test('should reponse in source', () => {
    return request(app).get('/')
        .then((res) => {
            expect(res.status).toEqual(200);
        });
});
