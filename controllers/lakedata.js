var fs = require('fs');
var mongojs = require('mongojs');
var db = mongojs('mongodb://localhost:27017/hydro-data', ['lakes']);

function LakeData(url) {}
// Gets the lake object corresponding to lakeName. If not found null is returned.
// Lake to be specified in encodedURI format.
LakeData.prototype.getLake = function(lakeName, callback) {
  var decodedLakeName = decodeURIComponent(lakeName);
  db.lakes.find({
    name: decodedLakeName
  }, callback);
};

// Returns an array of objects containing all lake names and their corresponding
// URI.
LakeData.prototype.lakes = function(callback) {
  db.lakes.find({
    name: {
      $exists: true
    }
  }, {
    name: 1,
    _id: 0
  }, function(err, names) {
    if (err) {
      throw new Error(err);
    }
    var data = names.map(function(e) {
      return {
        name: e.name,
        uri: encodeURIComponent(e.name)
      };
    });
    callback(data);
  });
};

// Returns an array of the historical lake levels from an encoded URI of the
// lake name. If no matches found returns an empty array.
LakeData.prototype.lakeLevels = function(lakeName, callback) {
  var lake = this.getLake(lakeName, function(err, data) {
    if (data.length === 0) {
      callback(data);
    } else {
      db.lakes.find({
        lakeId: data[0]._id
      }, {
        _id: 0,
        level: 1,
        date: 1
      }).sort({
          date: 1
        },
        function(err, data) {
          if (err) throw new Error(err);
          callback(data);
        });
    }
  });
};

// Returns an array of the current lake levels for all lakes. Assumes that the
// historical levels are sorted in ascending order.
LakeData.prototype.currentLevels = function(callback) {

  // Get all lake names for use later
  db.lakes.find({
      name: {
        $exists: true
      }
    },
    function(err, data) {
      // Get all the latest lake levels.
      if (err) throw new Error(err);
      // Store returned data in object to enable easy lookup
      var lakes = {};
      data.forEach(function(d) {
        lakes[d._id] = {
          name: d.name,
          capacity: d.capacity
        };
      });

      db.lakes.aggregate({
          $match: {
            lakeId: {
              $exists: true
            }
          }
        }, {
          $sort: {
            date: -1
          }
        }, {
          $group: {
            _id: '$lakeId',
            level: {
              $first: '$level'
            }
          }
        },
        function(err, data) {
          // Match the lake levels to the lake names by the ObjectId
          var currentLakeLevels = [];
          data.forEach(function(d) {
            currentLakeLevels.push({
              name: lakes[d._id].name,
              currentLevel: d.level,
              capacity: lakes[d._id].capacity
            });
          });
          callback(currentLakeLevels);
        });
    });
};

module.exports = LakeData;
