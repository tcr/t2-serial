#!/usr/bin/env node

var usb = require('usb');

function libusb (device) {
  this.device = device;
  this.conn = {};
  // *shakes fist at OSX*
  if (process.platform.toLowerCase() === 'darwin') {
    fixOSX.call(this);
  }
}

function fixOSX() {
  (function(self, __open) {
    self.device.__open = function() {
      __open.call(this);
      // injecting this line here to alleviate a bad error later
      this.__claimInterface(2);
    };
  })(this, this.device.__open);
};

libusb.prototype.open = function() {
  this.device.open();
};

libusb.prototype.close = function() {
  this.device.close();
};

libusb.prototype.setUpInterface = function (callback) {
  if (!this.device.interfaces) { return callback(new Error('Failed to set up interface: device is not currently open.')); }
  var endpoints = this.device.interfaces[2].endpoints;
  function checkep(ep) { return ep.direction === this.toString(); }

  var epin = endpoints.filter(checkep, 'in');
  var epout = endpoints.filter(checkep, 'out');

  if (!epin.length || !epout.length) {
    return callback(new Error('Failed to set up interface: could not find endpoint(s).'));
  }

  this.conn.endpointOut = epout[0];
  this.conn.endpointIn = epin[0];

  callback(null);
};

libusb.prototype.write = function (buffer, callback) {
  this.conn.endpointOut.transfer(buffer, function (error) {
    callback(error);
  });
}

libusb.prototype.read = function (length, callback) {
  this.conn.endpointIn.transfer(length, function (error, data) {
    callback(error, data);
  });
}

module.exports = libusb;

console.log('INFO Connecting to Tessel... (Ctrl+D to exit)');
var tessel = new libusb(usb.findByIds(0x1209, 0x7551))
tessel.open();
tessel.setUpInterface(function (err) {
  const readline = require('readline');

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', (chunk, key) => {
    if (chunk !== null) {
      tessel.write(chunk, function () {
        // done.
      })
    }
    if (key && key.ctrl && key.name == 'd') {
      process.exit(1);
    }
  });

  // Initial connection.
  tessel.write(new Buffer('\r\n'), function () {
  });

  function read_next () {
    tessel.read(64*1024, function (err, data) {
      if (err) {
        console.log(err);
      }
      if (data) {
        process.stdout.write(data);
      }
      setImmediate(read_next);
    })
  }
  read_next();
});
