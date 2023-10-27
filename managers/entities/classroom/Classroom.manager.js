module.exports = class Classroom { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels, mongoDB }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.tokenManager        = managers.token;
        this.httpExposed         = ['create', 'get=read', 'delete=delete'];
        this.crud                = mongoDB.CRUD(mongomodels.classroom);
        this.crud_school         = mongoDB.CRUD(mongomodels.school);
    }

    async create({label, __token}){
        
        const schoolId = __token.userKey;

        // Data validation
        let result = await this.validators.classroom.create({label, mongoId: schoolId});
        if(result) return {error: result[0].message, statusCode: 400};
        
        // Creation Logic
        const schools = await this.crud_school.read({_id:schoolId});
        if(schools.length == 0){
            return {error: 'school not found', statusCode: 400};
        }
        const newClass = await this.crud.create({label, school: schoolId});
        
        // Response
        return { 
            label: newClass.label,
            school: schools[0].name,
        };
    }

    async read({__token}){
        const schoolId = __token.userKey;

        // Data validation
        let result = await this.validators.classroom.schoolId({mongoId: schoolId});
        if(result) return {error: result[0].message, statusCode: 400};

        const schools = await this.crud_school.read({_id:schoolId});
        if(schools.length == 0){
            return {error: `school not found`, statusCode: 400};
        }

        const classrooms = await this.crud.read({school: schoolId});
        const classrooms_res = classrooms.map(_ => _.label);
        
        return {
            school: schools[0].name,
            classrooms: classrooms_res,
        };
    }

    async delete({label, __token}){
        const schoolId = __token.userKey;

        // Data validation
        let result = await this.validators.classroom.schoolId({mongoId: schoolId});
        if(result) return {error: result[0].message, statusCode: 400};

        const schools = await this.crud_school.read({_id:schoolId});
        if(schools.length == 0){
            return {error: `school not found`, statusCode: 400};
        }
        
        const school = schools[0];
        const classrooms = await this.crud.read({label});

        if(classrooms.length == 0){
            return {error: `classroom not found in school ${school.name}`, statusCode: 400};
        }

        await this.crud.delete(classrooms[0]._id);

        return {
            message: `Deleted classroom with the label ${label} in school ${school.name}`,
        };
    }

}
