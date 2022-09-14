module.exports = function ValidationError(message = 'este recurso não pertence ao usuário') {
    this.name = 'ResourceError';
    this.message = message;
};
