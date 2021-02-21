const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const { SECRET_KEY } = require("../../config");
const User = require('../../models/User');

module.exports = {
    Mutation: {
       async register(
        _,
        {
            registerInput: { username, email, password, confirmPassword }
        },
        ){
            //TODO: Validate user data
            //TODO: Make sure user does not already exist
            //TODO: hash password and create auth token
            const user = await User.findOne({ username });
            if(user){
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }
            const findEmail = await User.findOne({ email });
            if(findEmail){
                throw new UserInputError('Email is taken', {
                    errors: {
                        email: 'This email is taken'
                    }
                })
            }
            password = await bcrypt.hash(password, 12);

            const newUser = new User ({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = jwt.sign({
                id: res.id,
                email: res.email,
                username: res.username
            }, SECRET_KEY, { expiresIn: '1h'} );

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}