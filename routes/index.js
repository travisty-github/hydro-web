var express = require('express');
var router = express.Router();
var validator = require('validator');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about');
});

/* GET contact form page. */
router.get('/contact', function(req, res, next) {
  res.render('contactform');
});

/* POST contact form. */
router.post('/contact', function(req, res, next) {

  console.log(req.body.query, req.body.email);
  // Check correct fields sent for request body
  var requiredFields =  [
    {
      name: 'email',
      errorMessage: 'Missing email address in request.'
    },
    {
      name: 'query',
      errorMessage: 'Missing query message in request.'
    }
  ];

  requiredFields.forEach(function(field) {
    if (! req.body[field.name]) {
      res.status(400)
        .send(field.errorMessage);
    }
  });

  // Validate email address
  if (! validator.isEmail(req.body.email))
  {
    res.status(400)
      .send('Invalid email address.');
  }
  var query = validator.escape(req.body.query);

  // Send email

  res.send('ok');
});

module.exports = router;
