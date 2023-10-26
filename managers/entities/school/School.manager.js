module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, mongoDB }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.tokenManager        = managers.token;
        this.httpExposed         = ['create', 'get=read'];
        this.crud                = mongoDB.CRUD(mongomodels.school);
    }

    async create({name, address, url, __token}){
        const decoded = __token;
        if(decoded.userKey != 2){
            return {error: 'You should be a super admin to do that'};
        }

        const school = {name, address, url};

        // Data validation
        let result = await this.validators.school.createSchool(school);
        if(result) return result;
        
        // Creation Logic
        const createdSchool = await this.crud.create(school);
        
        // Response
        return { 
            name: createdSchool.name,
            address: createdSchool.address,
            url: createdSchool.url,
        };
    }

    async read({context}){
        const name = context;
        const schools = await this.crud.read({name});
        if(schools.length == 0){
            return {error: `no schools were found by the given name`};
        }
        
        const school = schools[0];
        return {
            name: school.name,
            address: school.address,
            url: school.url,
        };
    }

}
