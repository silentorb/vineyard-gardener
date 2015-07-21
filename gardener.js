/// <reference path="../vineyard/vineyard.d.ts"/>
/// <reference path="../vineyard-lawn/lawn.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vineyard = require('vineyard');
var Lawn = require('vineyard-lawn');
var when = require('when');
var MetaHub = require('vineyard-metahub');
var Gardener = (function (_super) {
    __extends(Gardener, _super);
    function Gardener() {
        _super.apply(this, arguments);
    }
    Gardener.prototype.grow = function () {
        var _this = this;
        var lawn = this.vineyard.bulbs.lawn;
        lawn.add_service({
            http_path: 'vineyard/gardener/schema',
            action: function (request, user) { return _this.get_schema(request, user); }
        });
    };
    Gardener.prototype.get_schema = function (request, user) {
        var fortress = this.vineyard.bulbs.fortress;
        var result = !fortress || fortress.user_has_role(user, 'admin') ? Gardener.export_schema(this.vineyard.ground, this.config.whitelist) : {};
        return when.resolve(result);
    };
    Gardener.export_schema = function (ground, whitelist) {
        var trellises = MetaHub.map_to_array(ground.trellises, function (trellis) { return Gardener.export_trellis(trellis); });
        if (Array.isArray(whitelist)) {
            trellises = trellises.filter(function (t) { return whitelist.indexOf(t.name) != -1; });
        }
        return {
            objects: trellises
        };
    };
    Gardener.export_trellis = function (trellis) {
        var result = {
            name: trellis.name
        };
        if (trellis.parent)
            result.parent = trellis.parent.name;
        else if (trellis.primary_key != 'id')
            result.primary_key = trellis.primary_key;
        if (trellis.is_virtual)
            result.is_virtual = true;
        result.properties = MetaHub.map(trellis.properties, function (property) { return Gardener.export_property(property); });
        return result;
    };
    Gardener.export_property = function (property) {
        var result = {
            type: property.type
        };
        if (property.other_trellis)
            result.trellis = property.other_trellis.name;
        if (property.is_virtual)
            result.is_virtual = true;
        if (property.insert)
            result.insert = property.insert;
        if (property.is_readonly)
            result.is_readonly = true;
        if (property.default !== undefined)
            result['default'] = property.default;
        if (property.allow_null)
            result.allow_null = true;
        if (property.other_property)
            result.other_property = property.other_property;
        return result;
    };
    return Gardener;
})(Vineyard.Bulb);
module.exports = Gardener;
//# sourceMappingURL=gardener.js.map