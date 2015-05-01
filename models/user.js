'use strict';

var mongoose = require('../conn');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
  email: { type: String, required: true, unique : true, dropDups: true },
  password: { type: String, required: true },
  fname: { type: String },
  lname: { type: String },
  phone: { type: String }
});

// encrypt
userSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

//Validation
User.schema.path('email').validate(function (value) {
  return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(value);
}, 'Invalid email');



module.exports = User;
