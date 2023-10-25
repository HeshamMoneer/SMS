module.exports = {
    modelName: "User",
    schemaDefinition: {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        accessRights: {
            type: Number,
            required: true,
            default: 0, // 0 -> no rights, 1 -> school admin, 2 -> super admin
        },
    }
}