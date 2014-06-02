#!/usr/bin/env node
!function () {
  'use strict';

  var fs = require('fs')
    , optipng = require('optipng-bin').path
    , jpegtran = require('jpegtran-bin').path
    , spawn = require('child_process').spawn
    , chalk = require('chalk')
    , cwd = process.cwd()
    , lists = getFiles(cwd);

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

  function optiJpg(lists, i) {
    i = i || 0;
    var len = lists.length;
    console.log(chalk.green('✓ ' + lists[i]));
    spawn(jpegtran, ['-copy', 'none', '-optimize', '-outfile', lists[i], lists[i]], { stdio: 'inherit' })
      .on('exit', function () {
        if (++i >= len) return process.exit();
        return optiJpg(lists, i);
      });
  }

  var imgs = filterPng(lists);
  function beginJpg() {
    imgs = filterJpg(lists);
    imgs.length ? 
      optiJpg(imgs) :
      process.exit();
  }

  imgs.length ?
    spawn(optipng, process.argv.slice(2).concat(imgs), { stdio: 'inherit' })
      .on('exit', beginJpg) :
    beginJpg();
}();