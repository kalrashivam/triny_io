var mongoose = require("mongoose");
var Validator = require("validator");
const jwt = require("jsonwebtoken");
var lodash = require("lodash");
const bcrypt = require("bcryptjs");

var InstituteSchema = new mongoose.Schema({
    email: {
        type: String,
        minlength: 1,
        trim: true,
        required: true,
        unique: true,
        validate: {
            validator: (value) => {
                return Validator.isEmail(value);
            },
            message: '{VALUE} is not valid email'
        }
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    accesskey: {
       type: String
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

InstituteSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return lodash.pick(userObject, ["_id", "email", "accesskey"]);
};

InstituteSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'mysecretkey').toString();
    user.tokens.push({ access, token });
    return user.save().then(() => {
        return token;
    });
};

InstituteSchema.statics.findByToken = function (token) {
    var user = this;
    try {
        decoded = jwt.verify(token, 'mysecretkey');
        return user.findOne({
            '_id': decoded._id,
            'tokens.token': token,
            'tokens.access': 'auth'
        });
    } catch (e) {
        return Promise.reject();
    }


}

InstituteSchema.statics.findByCredentials = function (email, password) {
    var user = this;

    return user.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res == true) {
                    resolve(user);
                } else {
                    reject();
                }
            })
        })
    });

};

InstituteSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    })
};

InstituteSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {

            bcrypt.hash(user.password, salt, (err, hash) => {
                console.log(user.password);
                user.password = hash;
                next();
            })
        })
    } else {
        console.log('trying');
        next();
    }
});

var institute = mongoose.model('Users', InstituteSchema);



module.exports = {
    institute
};
