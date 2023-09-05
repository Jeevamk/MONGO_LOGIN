const mongoose = require ('mongoose');
const bcrypt = require ('bcrypt');

const stdSchema = new mongoose.Schema({
    name : {
        type:String,
        required:true
    },
    email : {
        type: String,
        unique :true,
        required :true
    },
    phone : {
        type : Number,
        required : true
    },
    password :{
        type: String,
        required : true
    },
    cpassword :{
        type: String,
        required : true
    },
});

stdSchema.pre('save' , async function (next) {
    this.password = await bcrypt.hash(this.password , 10);
    // this.cpassword = await bcrypt.hash(this.cpassword , 10);
    this.cpassword = undefined;
    next();
    

})


//create a collection
const stdCollection = new mongoose.model('stdcollection', stdSchema );

module.exports = stdCollection;