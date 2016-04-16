var express = require('express');
var router = express.Router();
var validator = require('validator');
var nodemailer = require('nodemailer');

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

    // Check correct fields sent for request body
    var requiredFields = [{
        name: 'email',
        errorMessage: 'No email adress provided.'
    }, {
        name: 'query',
        errorMessage: 'No message provided.'
    }];

    for (var i = 0; i < requiredFields.length; i++) {
      if (!req.body[requiredFields[i].name]) {

      req.session.flash = {
        type: 'danger',
        message: requiredFields[i].errorMessage
      };

        res.status(400)
            .redirect('/contact');
          return;
      }
    }

    // Validate email address
    if (!validator.isEmail(req.body.email)) {
      req.session.flash = {
        type: 'danger',
        message: 'Invalid email address.'
      };

        res.status(400)
            .redirect('/contact');
            return;
    }

    var fromAddress = req.body.email;
    var query = validator.escape(req.body.query);

    // Send email
    var emailConfig = {
        host: config.app.email.host,
        port: config.app.email.port,
        secure: config.app.email.secure,
        auth: {
            user: config.app.email.user,
            pass: config.app.email.password
        }
    };

    var email = {
        from: config.app.email.user,
        to: config.app.email.user,
        subject: 'Tasmania Hydro Dam Levels Enquiry',
        text: 'Email from: ' + fromAddress + '\n\n' + query
    };

    var transporter = nodemailer.createTransport(emailConfig);
    transporter.sendMail(email, function(err, info) {
        if (err) {
            console.log(err);
            req.session.flash = {
              type: 'danger',
              message: 'Failed to send message: ' + err
            };
            res.status(500)
              .redirect('/contact');
              next();
        }

        console.log('Message sent: ' + info.response);

    req.session.flash = {
        type: 'success',
        message: 'Message sent.'
    };
    res.status(301)
        .redirect('/contact');
    });


});

module.exports = router;
