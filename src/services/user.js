const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const findAll = () => {
        return app.db('users').select(['id', 'name', 'email']);
    };

    const findOne = (filter = {}) => {
        return app.db('users').where(filter).first();
    };

    const getPasswordHash = (password) => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
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
        const userDb = await findOne({ email: user.email });
        if (userDb) {
            throw new ValidationError('já existe um usuário com esse e-mail');
        }

        const newUser = { ...user };
        newUser.password = getPasswordHash(user.password);
        return app.db('users').insert(newUser, ['id', 'name', 'email']);
    };

    return { findAll, save, findOne };
};
