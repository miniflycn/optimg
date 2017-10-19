#!/usr/bin/env node
!function () {
  'use strict';

  var fs = require('fs')
    , optipng = require('optipng-bin')
    , jpegtran = require('jpegtran-bin')
    , pngout = require('pngout-bin')
    , spawn = require('child_process').spawn
    , chalk = require('chalk')
    , cwd = process.cwd()
    , lists = getFiles(cwd)
    , each = require('each-async');

  function getFiles(root) {
    var res = [];
    fs.readdirSync(root).forEach(function (file) {
      var pathname = root + '/' + file,
        state = fs.lstatSync(pathname);

      state.isDirectory ?
        res.push(pathname.replace(cwd, '.')) :
        (res = res.concat(getFiles(pathname)));
    });
    return res;
  }

  function filterPng(lists) {
    var res = [],
      isImg = /\.(png|gif)$/;
    lists.forEach(function (file) {
      isImg.test(file) &&
        res.push(file);
    });
    return res;
  }

  function filterJpg(lists) {
    var res = [],
      isImg = /\.jpg$/;
    lists.forEach(function (file) {
      isImg.test(file) &&
        res.push(file);
    });
    return res;
  }

  function begin() {
    each(['jpg', 'png'], function (item, i, done) {
      exec[item](done);
    }, function () {
      process.exit();
    });
  }

  var exec = {
    jpg: function (cb) {
      each(filterJpg(lists), function (file, i, done) {
        console.log(chalk.green('✓ ' + file));
        spawn(jpegtran, ['-copy', 'none', '-optimize', '-outfile', file, file])
          .on('exit', function () {
            done();
          });
      }, function () {
        cb();
      });
    },
    png: function (cb) {
      var imgs = filterPng(lists);
      if (!imgs.length) cb();
      spawn(optipng, process.argv.slice(2).concat(imgs))
        .on('exit', function () {
          each(imgs, function (file, i, done) {
            spawn(pngout, ['-y', file, file])
              .on('exit', function () {
                done();
              });
          }, function () {
            cb();
          })
        })
    }
  };

  begin();
}();