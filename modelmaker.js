var fs = require('fs'),
    us = require('underscore');

var models_location = process.argv[2] || 'models',
    models_json_path = models_location+'.json',
    models = JSON.parse(fs.readFileSync(models_json_path)),
    out_path = '_'+models_location+'.ts';


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
    members: mapHash(members, function(member_name, member_opts){
      if (!us.isArray(member_opts)) member_opts = [member_opts];
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
