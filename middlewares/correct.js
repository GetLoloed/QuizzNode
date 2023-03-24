module.exports = (req,res,next) =>{
    if(!req.session.answer){
        req.session.answer = 0
    }
    res.locals.answer = req.session.answer

    next()
}