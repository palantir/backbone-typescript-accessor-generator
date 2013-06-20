/*
 * grunt-backbone-typescript-accessor-generator
 * -
 *
 * Copyright (c) 2013 Palantir Technologies
 * Licensed under the Apache-2.0 license.
 */

'use strict';

var modelmaker = require('../lib/modelmaker');

module.exports = function(grunt) {
  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  var description = 'Generates backbone models with typed subclasses for useing Backbone.js with TypeScript and its type system';
  grunt.registerMultiTask('backbone_typescript_accessor_generator', description, function() {

    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      modelmaker.generate_typescript(f.src[0], f.dest);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
