var fs = require('fs');

function LakeData(fileName) {
  try {
    fs.accessSync(fileName, fs.R_OK, function(err) {
      console.log('Cannot read file' + fileName);
      throw new Error(err);
    });
  } catch (err) {
    console.log('Failed to open ' + fileName);
    console.log(err);
    throw new Error(err);
  }

  this.jsonData = fs.readFileSync(fileName);
  try {
    this.data = JSON.parse(this.jsonData);
  } catch (err) {
    console.log('Failed to parse data file.');
    console.log(err);
    throw new Error(err);
  }
}
// Gets the lake object corresponding to lakeName. If not found null is returned.
// Lake to be specified in encodedURI format.
LakeData.prototype._getLake = function(lakeName) {
  var decodedLakeName = decodeURIComponent(lakeName);
  console.log(decodedLakeName);
  var lake = this.data.filter(function(d) {
    return decodedLakeName === d.name;
  });

  // Each lake name should be unique. If there are duplicates this is a problem.
  if (lake.length > 1)
    throw new Error('Duplicate lakes found.');

  // If no matches found return null.
  if (lake.length === 0) {
    return null;
  }

  return lake;
};

// Returns an array of objects containing all lake names and their corresponding
// URI.
LakeData.prototype.lakes = function() {
  return this.data.map(function(d) {
    return {
      name: d.name,
      uri: encodeURIComponent(d.name)
    };
  });
};

// Returns an array of the historical lake levels from an encoded URI of the
// lake name
LakeData.prototype.lakeLevels = function(lakeName) {
  var lake = this._getLake(lakeName);
  return lake[0].historicalLevels;
};

module.exports = LakeData;
