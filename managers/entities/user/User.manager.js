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
        this.crud_school         = mongoDB.CRUD(mongomodels.school);
    }

    async createUser({username, email, password}){
        const user = {username, email, password};

        // Data validation
        let result = await this.validators.user.createUser(user);
        if(result) return {error: result[0].message, statusCode: 400};
        
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

    async updateUserAccessRights({email, accessRights, __super}){

        let result = await this.validators.user.updateUserAccessRights({accessRights});
        if(result) return {error: result[0].message, statusCode: 400};

        const oldUsers = await this.crud.read({email});
        if(oldUsers.length == 0){
            return {error: "user to update does not exist", statusCode: 400};
        }
        const oldUser = oldUsers[0];

        let res_accessRights = accessRights.split(':')[0];

        if(accessRights.includes('school')){
            const school_name = accessRights.split(':')[1];
            const schools = await this.crud_school.read({name:school_name});
            if(schools.length == 0){
                return {error: `School ${school_name} not found`, statusCode: 400};
            }

            const school_id = schools[0]._id;
            accessRights = school_id;
        }

        const newUser = await this.crud.update(oldUser._id, {accessRights});
        
        return {email: newUser.email, accessRights: res_accessRights};
    }

}
