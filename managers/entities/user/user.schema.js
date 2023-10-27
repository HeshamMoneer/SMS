

module.exports = {
    createUser: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
    ],
    updateUserAccessRights: [
        {
            model: 'accessRights',
            required: true,
        },
    ],
}


