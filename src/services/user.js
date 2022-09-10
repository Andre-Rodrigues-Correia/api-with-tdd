module.exports = (app) => {
    const findAll = (filter = {}) => {
        return app.db('users').where(filter).select();
    };

    const save = async (user) => {
        if (!user.name) {
            return {
                error: 'nome é um atributo obrigatório',
            };
        }
        if (!user.email) {
            return {
                error: 'e-mail é um atributo obrigatório',
            };
        }

        if (!user.password) {
            return {
                error: 'senha é um atributo obrigatório',
            };
        }

        const userDb = await findAll({ email: user.email });
        if (userDb && userDb.length > 0) {
            return {
                error: 'já existe um usuário com esse e-mail',
            };
        }

        return app.db('users').insert(user, '*');
    };

    return { findAll, save };
};
