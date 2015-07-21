/// <reference path="../vineyard/vineyard.d.ts"/>
/// <reference path="../vineyard-lawn/lawn.d.ts"/>

import Vineyard = require('vineyard')
var Lawn = require('vineyard-lawn')
var when = require('when')
var MetaHub = require('vineyard-metahub')

class Gardener extends Vineyard.Bulb {

  grow() {
    var lawn = this.vineyard.bulbs.lawn
    lawn.add_service({
      http_path: 'vineyard/gardener/schema',
      action: (request, user)=> this.get_schema(request, user)
    })
  }

  get_schema(request, user):Promise {
    var fortress = this.vineyard.bulbs.fortress
    var result = !fortress || fortress.user_has_role(user, 'admin')
      ? Gardener.export_schema(this.vineyard.ground, this.config.whitelist)
      : {}

    return when.resolve(result)
  }

  static export_schema(ground:Ground.Core, whitelist:string[]) {
    var trellises = MetaHub.map_to_array(ground.trellises, (trellis) => Gardener.export_trellis(trellis))

    if (Array.isArray(whitelist)) {
      trellises = trellises.filter((t)=> whitelist.indexOf(t.name) != -1)
    }

    return {
      objects: trellises
    }
  }

  static export_trellis(trellis:Ground.Trellis) {
    var result:Ground.ITrellis_Source = {
      name: trellis.name
    }
    if (trellis.parent)
      result.parent = trellis.parent.name
    else if (trellis.primary_key != 'id')
      result.primary_key = trellis.primary_key

    if (trellis.is_virtual)
      result.is_virtual = true

    result.properties = MetaHub.map(trellis.properties, (property) => Gardener.export_property(property))

    return result
  }

  static export_property(property:Ground.Property) {
    var result:Ground.IProperty_Source = {
      type: property.type
    }
    if (property.other_trellis)
      result.trellis = property.other_trellis.name

    if (property.is_virtual)
      result.is_virtual = true

    if (property.insert)
      result.insert = property.insert

    if (property.is_readonly)
      result.is_readonly = true

    if (property.default !== undefined)
      result['default'] = property.default

    if (property.allow_null)
      result.allow_null = true

    if (property.other_property)
      result.other_property = property.other_property;

    return result
  }
}

module.exports = Gardener