node-dav
========

##Installation

npm install node-dav

##about

node-dav is a webdav client on nodejs, tested on box.com.

##example

```
var Dav = require('node-dav');

var dav = new Dav('node.dav@gmail.com', 'tokunepwd', 'https://dav.box.com/dav/');
dav.GET('dav.js', function(err, body) {
    !err && console.log(body);
})
```

##my upload img worker

```
var Dav = require('dav');
var dav = new Dav("i@email.com", "password", 'https://dav.box.com/dav/');
var async = require('async');

var fs = require('fs');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

var Worker = function() {
    this.tempPath = '';
}

Worker.prototype.mkcols = function(cols, callback) {
    var self = this;
    if (cols.length < 2) {
        self.tempPath = '';
        return callback();
    }
    self.tempPath += cols.shift() + '/';
    dav.MKCOL(self.tempPath, function(err) {
        if (err) return callback(err);
        console.log('mked', self.tempPath);
        self.mkcols(cols, callback);
    });
}

Worker.prototype.put = function(path, callback) {
    var self = this;
    async.waterfall([
        function(next) {
            dav.PROPFIND(path, function(err) {
                if (err && err.err === 'not found') return next(null, true);
                else if(err) return next(err);
                next(null, false);
            });
        },
        function(exist, next) {
            if (exist) {
                console.log('exist ' + path);
                return next();
            }
            dav.PUT(path, path, function(err, response) {
                if (!err) {
                    console.log('updated', path);
                    return callback();
                }
                if (err && err.err === 'file not found') {
                    var cols = path.split('/');
                    return self.mkcols(cols, function(err) {
                        if (err) return next(err);
                        self.put(path, next);
                    });
                }
                else next(err);
            });
        }
    ], function(err) {
        if (err) return callback(err);
        callback();
    });
}

walk('./CloudKit', function(err, results) {
    if (err) throw err;

    async.eachLimit(results, 5, function(path, done) {
        worker = new Worker();
        path = path.replace(/^\.\//, '');
        worker.put(path, function(err) {
            if (err) return done(err);
            done();
        });
    }, function(err){
        if (err) return console.log(err);
        console.log('done');
    });
});
```
