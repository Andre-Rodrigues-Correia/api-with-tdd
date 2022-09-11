const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const findAll = (filter = {}) => {
        return app.db('users').where(filter).select();
    };

    const save = async (user) => {
        if (!user.name) {
            throw new ValidationError('nome é um atributo obrigatório');
        }
        if (!user.email) {
            throw new ValidationError('e-mail é um atributo obrigatório');
        }

        if (!user.password) {
            throw new ValidationError('senha é um atributo obrigatório');
        }
        const userDb = await findAll({ email: user.email });
        if (userDb && userDb.length > 0) {
            throw new ValidationError('já existe um usuário com esse e-mail');
        }

        return app.db('users').insert(user, '*');
    };

    return { findAll, save };
};
