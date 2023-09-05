const mongoose = require ('mongoose');
const cookieParser = require ('cookie-parser')
const model = require("../model/model")

const auth = async (req,res,next)=>{
    try {
        const stdId = req.cookies.session;
    // console.log(stdId);
    if(!stdId){
        res.redirect("/");
        return;
    }

    const student = await model.findById(stdId)

    if(!student){
        res.redirect("/")
    }else{
        req.student = student;
        next()
    }
    } catch (error) {
        console.error(error);
    }
}


module.exports = auth;