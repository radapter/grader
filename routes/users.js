var express = require('express');
var router = express.Router();

var User = require('../models/user');

function requireLogin (req, res, next) {
  if (!req.session.user) {
    res.status(403).json({status:403, message:"Login Required!"});
  } else {
    next();
  }
};

/* GET users listing. */
router.get('/', requireLogin, function(req, res) {
  var query = User.find({}).select('email fname lname phone userType');
  query.exec(function(err, users){
    if(err){
      res.status(500).json(err);
    }else{
      res.json({
        users:users
      });
    }
  });
});

/* Login */
router.post('/login', function(req, res){
  var data = req.body;
  User.findOne({ email: data.email }, function(err, user){
    if(err || user==null){
      res.status(403).json({status:403, message:"User not find!"});
    }else{
      user.comparePassword(data.password, function(err, isMatch){
        if(err || !isMatch){
          res.status(403).json(err||{status:403, message:"Invalid Password"});
        }else{
          req.session.user = user;
          delete req.session.user.password;
          delete user.password;
          res.json({
            status:200,
            message:"success",
            id:user._id,
            user:user
          });
        }
      });
    }
  });
});

/* Logout */
router.post('/logout', function(req, res){
  req.session.destroy();
  res.json({status:200, message:"success"});
});

/* Signup */
router.post('/signup', function(req, res){
  var data = req.body;
  var user = new User(data);
  user.save(function(err){
    if (err){
      res.status(400).json(err);
    }else{
      res.json({
        status:200,
        message:"success",
        id:user._id
      });
    }
  });
});

module.exports = router;
