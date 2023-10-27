module.exports = class School { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, mongoDB }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.tokenManager        = managers.token;
        this.httpExposed         = ['create', 'get=read', 'patch=update', 'delete=delete'];
        this.crud                = mongoDB.CRUD(mongomodels.school);
    }

    async create({name, address, url, __token, __super}){
        const school = {name, address, url};

        // Data validation
        let result = await this.validators.school.create(school);
        if(result) return {error: result[0].message, statusCode: 400};
        
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
            return {error: `no schools were found by the given name`, statusCode: 400};
        }
        
        const school = schools[0];
        return {
            name: school.name,
            address: school.address,
            url: school.url,
        };
    }

    async update({name, address, url, context, __token, __super}){
        const oldSchools = await this.crud.read({name});
        if(oldSchools.length == 0){
            return {message: `no schools were found by the given name`, statusCode: 400};
        }

        const oldSchoolId = oldSchools[0]._id;
        let data = {};
        if(address) data = {...data, address};
        if(url) data = {...data, url};
        const updatedSchool = await this.crud.update(oldSchoolId, data);

        return {
            name: updatedSchool.name,
            url: updatedSchool.url,
            address: updatedSchool.address,
        }
    }

    async delete({context, __token, __super}){
        const name = context;
        const schools = await this.crud.read({name});
        if(schools.length == 0){
            return {error: `no schools were found by the given name`, statusCode: 400};
        }
        
        const deletedSchool = await this.crud.delete(schools[0]._id);
        return {
            name: deletedSchool.name,
            address: deletedSchool.address,
            url: deletedSchool.url,
        };
    }

}
