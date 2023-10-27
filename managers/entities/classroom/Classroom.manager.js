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

    async create({label, __token, __school}){
        
        const schoolId   = __school.schoolId;
        const schoolName = __school.schoolName;
        const newClass   = await this.crud.create({label, school: schoolId});
        
        // Response
        return { 
            label: newClass.label,
            school: schoolName,
        };
    }

    async read({__token, __school}){
        const schoolId   = __school.schoolId;
        const schoolName = __school.schoolName;

        const classrooms = await this.crud.read({school: schoolId});
        const classroomsRes = classrooms.map(_ => _.label);
        
        return {
            school: schoolName,
            classrooms: classroomsRes,
        };
    }

    async delete({label, __token, __school}){
        const schoolId   = __school.schoolId;
        const schoolName = __school.schoolName;
        const classrooms = await this.crud.read({label, school:schoolId});

        if(classrooms.length == 0){
            return {error: `classroom not found in school ${schoolName}`, statusCode: 400};
        }

        await this.crud.delete(classrooms[0]._id);

        return {
            message: `Deleted classroom with the label ${label} in school ${schoolName}`,
        };
    }

}
