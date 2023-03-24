module.exports = (req,res,next) =>{
    if(!req.session.username){
        req.session.username = 'Anonyme'
    }
    res.locals.username = req.session.username

    next()
}