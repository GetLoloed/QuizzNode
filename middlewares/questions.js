module.exports = (req, res, next) => {
    if (!req.session.question) {
        req.session.question = 0
    }
    res.locals.question = req.session.question
    if (!req.session.score) {
        req.session.score = 0
    }

    next()
}