const bcrypt = require('bcrypt');
const bcrypt_saltRounds = 10;

module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, mongoDB }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.mongoDB             = mongoDB;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.httpExposed         = ['createUser'];
    }

    async createUser({username, email, password}){
        const user = {username, email, password};

        // Data validation
        let result = await this.validators.user.createUser(user);
        if(result) return result;
        
        // Creation Logic
        const crud = this.mongoDB.CRUD(this.mongomodels.user);
        const passwordHash = await bcrypt.hashSync(password, bcrypt_saltRounds);
        const createdUser = await crud.create({username, email, passwordHash});

        let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, userKey: createdUser.key });
        
        // Response
        return { 
            longToken 
        };
    }

}
