const bcrypt = require('bcrypt');
const bcrypt_saltRounds = 10;

module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, mongoDB }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.httpExposed         = ['createUser', 'loginUser', 'updateUserAccessRights'];
        this.crud                = mongoDB.CRUD(mongomodels.user);
    }

    async createUser({username, email, password}){
        const user = {username, email, password};

        // Data validation
        let result = await this.validators.user.createUser(user);
        if(result) return result;
        
        // Creation Logic
        const passwordHash = await bcrypt.hashSync(password, bcrypt_saltRounds);
        const createdUser = await this.crud.create({username, email, passwordHash});

        let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, userKey: createdUser.accessRights });
        
        // Response
        return { 
            longToken 
        };
    }

    async loginUser({email, password}){
        const users = await this.crud.read({email});
        if(users.length == 0){
            return {error: "email not found", statusCode: 400};
        }
        const user = users[0];
        const passwordMatch = await bcrypt.compareSync(password, user.passwordHash);
        if(!passwordMatch){
            return {error: "wrong password", statusCode: 400};
        }

        let longToken = this.tokenManager.genLongToken({userId: user._id, userKey: user.accessRights});

        return {longToken}
    }

    async updateUserAccessRights({email, accessRights, __token}){
        const decoded = __token;
        if(decoded.userKey != 2){
            return {error: 'You should be a super admin to do that', statusCode: 401};
        }

        const oldUsers = await this.crud.read({email});
        if(oldUsers.length == 0){
            return {error: "user to update does not exist", statusCode: 400};
        }
        const oldUser = oldUsers[0];
        const newUser = await this.crud.update(oldUser._id, {accessRights});

        return {email: newUser.email, accessRights: newUser.accessRights};
    }

}
