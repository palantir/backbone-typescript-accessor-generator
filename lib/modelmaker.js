
var fs = require('fs'),
    us = require('underscore'),
  yaml = require('js-yaml'),
  path = require('path');

function mapHash(hash, mapper) {
  return Object.keys(hash).map(function(key){
    var value = hash[key];
    return mapper(key, value);
  });
}

function checkAndRemove(arr, val) {
  var index = arr.indexOf(val);
  if (index < 0) return false;
  arr.splice(index, 1);
  return true;
}

function default_dest(src, out_ext, models_ext) {
  var basename = path.basename(src, models_ext || '.models.yml');
  var dir = path.dirname(src);
  return path.join(dir, basename + (out_ext || '-models.ts'));
}
exports.default_dest = default_dest;

var primitives = ['string', 'bool', 'number', 'any', 'any[]', 'Object'];

exports.generate_typescript = function(src, dest) {
  dest = dest || default_dest(src);
  var models = yaml.safeLoad(fs.readFileSync(src, encoding='utf-8'));

  var normalized_models = mapHash(models, function(model_name, members){
    return {
      name: model_name,
      members: mapHash(members, function(member_name, member_def){
        var member_opts = member_def.split(' ');
        return {
          name: member_name,
          readonly: checkAndRemove(member_opts, 'readonly'),
          optional: checkAndRemove(member_opts, 'optional'),
          type: us.last(member_opts)
        };
      })
    };
  });

  var template = fs.readFileSync(__dirname + '/template.ts', encoding='utf-8');
  var output = us.template(template, {models: normalized_models, primitives: primitives});
  fs.writeFileSync(dest, output);
}

/*
TODO:
[ ] handle arrays (of primitives, models, and complex types) in parsing and fromJSON
[ ] handle type specializations in parsing and fromJSON
[ ] add runtime exceptions on type conflicitng assignments
[ ] add usage to readme
[ ] add to npm
[ ] optionally throw on additional fields
[ ] add non-backbone support
*/
