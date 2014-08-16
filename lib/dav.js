var request = require('request');
var fs = require('fs');
var xmlreader = require('xmlreader');
var Dav = module.exports = function(username, passwd, basePath) {
    this.username = username;
    this.passwd = passwd;
    this.basePath = basePath;
}

Dav.prototype.PROPFIND = function(path, callback) {
    request({
        method: 'PROPFIND', 
        uri:this.basePath + path, 
        auth: {
            'user': this.username,
            'pass': this.passwd,
        }
    }, function (error, response, body) {
          if (error) return callback(err);
          if (response.statusCode === 404) 
              return callback({err:"not found"});

          xmlreader.read(body, function(error, response){  
              if(error) return callback(error);
              callback(null, response);  
          });
    })
}

Dav.prototype.GET = function(path, callback) {
    request({
        method: 'GET', 
        uri:this.basePath + path, 
        auth: {
            'user': this.username,
            'pass': this.passwd,
        }
    }, function (error, response, body) {
          if (error) return callback(err);
          else if (response.statusCode === 404) 
              return callback({err:"file not found"});
          else if (response.statusCode !== 200) 
              return callback({err:"error statusCode"});

          callback(null, body);  
    })
}

Dav.prototype.DELETE = function(path, callback) {
    request({
        method: 'DELETE', 
        uri:this.basePath + path, 
        auth: {
            'user': this.username,
            'pass': this.passwd,
        }
    }, function (error, response, body) {
          if (error) return callback(err);
          else if (response.statusCode === 404) 
              return callback({err:"file not found"});
          else if (response.statusCode !== 200) 
              return callback({err:"error statusCode"});

          callback(null, body);  
    })
}

Dav.prototype.PUT = function(file, path, callback) {
    fs.createReadStream(file).pipe(request.put({
        uri:this.basePath + path, 
        auth: {
            'user': this.username,
            'pass': this.passwd,
        }
    }, function (error, response, body) {
        if (error) return callback(err);
        else if (response.statusCode === 404) 
            return callback({err:"file not found"});

        callback(null, body);  
    }))
}

Dav.prototype.MKCOL = function(path, callback) {
    request({
        method: 'MKCOL', 
        uri:this.basePath + path, 
        auth: {
            'user': this.username,
            'pass': this.passwd,
        }
    }, function (error, response, body) {
          if (error) {
              return callback(error);
          }

          callback(null, body);  
    })
}
