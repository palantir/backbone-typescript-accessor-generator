
var fs = require('fs'),
    us = require('underscore'),
  yaml = require('js-yaml');

if (!process.argv[2]) {
  console.log('requires argument');
  process.exit();
}

var models_location = process.argv[2],
    models_json_path = models_location+'.models.yml',
    models = yaml.safeLoad(fs.readFileSync(models_json_path, encoding='utf-8')),
    out_path = models_location+'.models.ts';

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
var output = us.template(template, {models: normalized_models});
fs.writeFileSync(out_path, output);

/*
TODO:
[ ] grunt plugin
[ ] handle paths more reasonably
[ ] add to npm
[ ] throw on additional fields
*/
