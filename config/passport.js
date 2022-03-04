const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Users = require('../models/Users');

module.exports = (passport) => {
    /**
     * This passport authentication is for User
     */
    passport.use(
        new LocalStrategy(
            { usernameField: 'phone', passwordField:'password' }, 
            (username, password, done) => {
                
                Users.findOne({ $or: [{phone: username}, {id: username.toUpperCase()}] })
                .then(user => {
                    if(!user){
                        return done(null, 'Username Incorrect');
                    }

                    bcrypt.compare(password, user.password)
                        .then(async(isMatch) => {
                            if(isMatch){
                                return done(null, user)
                            }
                            
                            return done(null, 'Password Incorrect');
                        })
                        .catch(err => console.error(err));
                })
                .catch(err => console.error(err));

        })
    );


    passport.serializeUser((user, done)=>{
        return done(null, user._id);
    });

    passport.deserializeUser((id, done)=>{
        Users.findById({ _id: id }, (err, user)=>{
            return done(err, user);
        })
    });
}