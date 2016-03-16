var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET graph page. */
router.get('/graph', function(req, res) {
  res.render('graph.ejs');
});

/* GET treemap page. */
router.get('/treemap', function(req, res) {
  res.render('treemap.ejs');
});

module.exports = router;
