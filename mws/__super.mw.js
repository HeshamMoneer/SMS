module.exports = ({ meta, config, managers }) =>{
    return ({req, res, next, results})=>{
        const accessRights = results.__token.userKey;;
        if(accessRights !== "super"){
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized, you must be a super admin'});
        }
    
        next(decoded);
    }
}