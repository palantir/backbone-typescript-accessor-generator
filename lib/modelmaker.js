
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

function stringEndsWith(str, suffix) {
    return str.indexOf(suffix, this.length - suffix.length) !== -1;
};

function default_dest(src, out_ext, models_ext) {
  var basename = path.basename(src, models_ext || '.models.yml');
  var dir = path.dirname(src);
  return path.join(dir, basename + (out_ext || '-models.ts'));
}
exports.default_dest = default_dest;

var primitives = ['string', 'bool', 'boolean', 'number', 'any', 'Object'];

function isPrimitive(type_desc) {
  if (us.contains(primitives, type_desc.typename)) {
    return true;
  } else if (type_desc.type === 'array') {
    return isPrimitive(type_desc.subtype);
  } else {
    return false;
  }
}

function typefromstring(typestring) {
  if (stringEndsWith(typestring, '[]')) {
    return {
      type: 'array',
      typename: typestring,
      subtype: typefromstring(typestring.slice(0,typestring.length-2))
    };
  } else {
    if (typestring == 'bool') typestring = 'boolean';
    return {
      type: typestring,
      typename: typestring
    };
  }
}

function deserializingCode(typeDesc, serialized) {
  if (typeDesc.type === 'array') {
    return serialized + '.map(function(o){return ' + deserializingCode(typeDesc.subtype, 'o') + ';})';
  }
  if (us.contains(primitives, typeDesc.type)) {
    return serialized;
  } else {
    return typeDesc.type + '.fromJSON(' + serialized + ')';
  }
}

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
          type: typefromstring(us.last(member_opts))
        };
      })
    };
  });

  var template = fs.readFileSync(__dirname + '/template.ts', encoding='utf-8');
  var output = us.template(template, {
    models: normalized_models,
    primitives: primitives,
    isPrimitive: isPrimitive,
    log: function(o){console.log(o); return o;},
    deserialized: deserializingCode
     });
  fs.writeFileSync(dest, output);
}

/*
TODO:
[ ] add usage to readme
[ ] add to npm
[ ] handle type specializations in parsing and fromJSON
[ ] optionally throw on additional fields
[ ] add non-backbone support
[ ] add runtime exceptions on type conflicitng assignments
[ ] typecheck primitives in fromJSON
[ ] consider camel-case accessors
[ ] we're assuming Array.map exists
*/
