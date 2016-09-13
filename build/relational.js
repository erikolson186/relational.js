'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var deepEqual = require('deep-equal'),
    clone = require('clone'),
    algebra = require('algebra.js');

var INDEFINITE = Symbol.for('indefinite');

var union = function union(r, s) {
    var results = [].concat(_toConsumableArray(r));

    var fn = function fn(s_tuple) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = results[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var tuple = _step.value;

                if (deepEqual(s_tuple, tuple)) {
                    return;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        results.push(s_tuple);
    };

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = s[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var s_tuple = _step2.value;
            fn(s_tuple);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return results;
};

var _add = function _add(results, r_tuple, s_tuple) {
    results.push(Object.assign(clone(r_tuple), clone(s_tuple)));
};

var times = function times(r, s) {
    var results = [];

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = r[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var r_tuple = _step3.value;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = s[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var s_tuple = _step4.value;

                    _add(results, r_tuple, s_tuple);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return results;
};

var join = function join(r, s, fields) {
    var results = [];

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = r[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var r_tuple = _step5.value;

            var params = {};
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = fields[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var field = _step6.value;
                    params[field] = r_tuple[field];
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }

            var s_results = s._select(params);
            if (s_results === INDEFINITE) {
                return s_results;
            }

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = s_results[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var s_tuple = _step7.value;

                    _add(results, r_tuple, s_tuple);
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    return results;
};

var Relation = function () {
    function Relation(heading, body, ruleFn) {
        var _this = this;

        _classCallCheck(this, Relation);

        this._indefinite = false;
        this._degree = 0;
        this._body = [];
        this._select = this._select1;

        if (ruleFn) {
            this.rule(ruleFn);
        }

        var addBody = function addBody() {
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = body[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var tuple = _step8.value;
                    _this.add(tuple);
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
        };

        if (!heading) {
            this._heading = {};

            if (!body || !body[0]) {
                return;
            }

            var tuple = body.shift();

            for (var field in tuple) {
                var type = tuple[field];

                if (type == null) {
                    throw Error('attribute \'' + field + '\' type is ' + type);
                }

                this._heading[field] = type.constructor;
                this._degree++;
            }

            if (!this._degree) {
                return;
            }
            if (!this.has(tuple)) {
                this._body.push(tuple);
            }

            return addBody();
        }

        this._heading = heading;

        for (var _field in heading) {
            var _type = heading[_field];

            if (_type == null) {
                throw Error('heading attribute \'' + _field + '\' type is ' + _type);
            }

            this._degree++;
        }

        if (this._degree && body) {
            return addBody();
        }
    }

    _createClass(Relation, [{
        key: Symbol.iterator,
        value: function value() {
            return this.values();
        }
    }, {
        key: 'add',
        value: function add(tuple) {
            if (!this._degree) {
                return this;
            }

            for (var field in this._heading) {
                if (!tuple.hasOwnProperty(field)) {
                    throw Error('tuple is missing attribute \'' + field + '\'');
                }

                var field_type = tuple[field];

                if (field_type == null) {
                    throw Error('attribute \'' + field + '\' is ' + field_type);
                }

                if (field_type.constructor !== this._heading[field]) {
                    var type = this._heading[field].name;

                    throw Error('attribute \'' + field + '\' must be of type ' + type);
                }
            }

            if (!this.has(tuple)) {
                this._body.push(clone(tuple));
            }

            return this;
        }
    }, {
        key: 'delete',
        value: function _delete(tuple) {
            var found_it = false;

            if (this._indefinite && this._ruleFn(tuple)) {
                found_it = true;

                this.rule(function (params) {
                    return !deepEqual(tuple, params);
                });
            }

            for (var i = 0; i < this._body.length; i++) {
                if (deepEqual(tuple, this._body[i])) {
                    found_it = true;

                    this._body.splice(i, 1);

                    break;
                }
            }

            return found_it;
        }
    }, {
        key: 'entries',
        value: function entries() {
            var values_it = this.values();
            var entries = [][Symbol.iterator]();

            entries.next = function () {
                var obj = values_it.next();

                if (obj.value) {
                    obj.value = [obj.value, obj.value];
                }

                return obj;
            };

            return entries;
        }
    }, {
        key: 'forEach',
        value: function forEach(fn, this_arg) {
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = this.values()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var tuple = _step9.value;

                    fn.call(this_arg, tuple);
                }
            } catch (err) {
                _didIteratorError9 = true;
                _iteratorError9 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                        _iterator9.return();
                    }
                } finally {
                    if (_didIteratorError9) {
                        throw _iteratorError9;
                    }
                }
            }
        }
    }, {
        key: 'has',
        value: function has(tuple) {
            var results = this._select(tuple);

            if (results === INDEFINITE || results.length) {
                return true;
            }

            return false;
        }
    }, {
        key: 'keys',
        value: function keys() {
            return this.values();
        }
    }, {
        key: 'values',
        value: function values() {
            this._assertDefiniteSize();

            return this._body[Symbol.iterator]();
        }
    }, {
        key: '_select1',
        value: function _select1(params) {
            var fields = Object.keys(params);
            if (!fields.length) {
                return clone(this._body);
            }

            var results = [];

            this._body.forEach(function (tuple) {
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = fields[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var field = _step10.value;

                        if (!deepEqual(tuple[field], params[field])) {
                            return;
                        }
                    }
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }

                results.push(clone(tuple));
            });

            return results;
        }
    }, {
        key: '_select2',
        value: function _select2(params) {
            var select_results = this._select1(params);
            if (select_results === INDEFINITE) {
                return select_results;
            }

            var fn_results = this._ruleFn(params);
            if (fn_results === INDEFINITE) {
                return fn_results;
            }
            if (!fn_results) {
                return select_results;
            }

            fn_results = fn_results === true ? [{}] : [].concat(_toConsumableArray(fn_results));

            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = fn_results[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var tuple = _step11.value;

                    for (var param in params) {
                        tuple[param] = params[param];
                    }
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            return union(select_results, fn_results);
        }
    }, {
        key: 'rule',
        value: function rule(fn) {
            this._indefinite = true;
            this._ruleFn = fn;
            this._select = this._select2;
        }
    }, {
        key: 'toBoolean',
        value: function toBoolean() {
            return this._indefinite || this._body.length > 0;
        }
    }, {
        key: '_getCommonFreeVariables',
        value: function _getCommonFreeVariables(s) {
            var common_vars = [];

            for (var field in this._heading) {
                if (s._heading[field]) {
                    if (this._heading[field] !== s._heading[field]) {
                        throw Error('type mismatch for attribute \'' + field + '\'');
                    }

                    common_vars.push(field);
                }
            }

            return common_vars;
        }
    }, {
        key: '_assertDefiniteSize',
        value: function _assertDefiniteSize() {
            if (this._indefinite) {
                throw Error('relation must have a definite cardinality');
            }
        }
    }, {
        key: '_andOneIndefinite',
        value: function _andOneIndefinite(r, s, common_vars, rel) {
            var results = join(r, s, common_vars);

            if (results === INDEFINITE) {
                rel.rule(function (params) {
                    var new_common_vars = new Set(common_vars);

                    for (var field in rel.heading) {
                        if (params.hasOwnProperty(field)) {
                            new_common_vars.add(field);
                        }
                    }

                    return join(times(r, [params]), s, new_common_vars);
                });
            } else {
                rel._body = results;
            }

            return rel;
        }
    }, {
        key: '_andBothIndefinite',
        value: function _andBothIndefinite(r, s, rel, and) {
            var ruleFn = function ruleFn(params) {
                var r_params = {},
                    s_params = {};

                for (var param in params) {
                    if (r._heading[param]) {
                        r_params[param] = params[param];
                    }

                    if (s._heading[param]) {
                        s_params[param] = params[param];
                    }
                }

                var r_results = r._select(r_params);
                if (r_results === INDEFINITE) {
                    return r_results;
                }
                if (!r_results.length) {
                    return;
                }

                var s_results = s._select(s_params);
                if (s_results === INDEFINITE) {
                    return s_results;
                }
                if (!s_results.length) {
                    return;
                }

                return and(r_results, s_results);
            };

            rel.rule(ruleFn);

            return rel;
        }
    }, {
        key: '_and',
        value: function _and(s, common_vars) {
            var r = this,
                heading = Object.assign({}, r._heading, s._heading),
                rel = new Relation(heading);

            if (!r.size || !s.size) {
                return rel;
            }

            if (!common_vars.length) {
                if (!r._indefinite && !s._indefinite) {
                    var results = times(r, s);

                    rel._body = results;

                    return rel;
                }

                return this._andBothIndefinite(r, s, rel, times);
            }

            if (r._indefinite) {
                if (!s._indefinite) {
                    return this._andOneIndefinite(s, r, common_vars, rel);
                }
            } else if (s._indefinite) {
                return this._andOneIndefinite(r, s, common_vars, rel);
            } else {
                rel._body = join(r, s, common_vars);

                return rel;
            }

            var and = function and(r_results, s_results) {
                var new_s = {
                    _heading: s._heading,
                    _body: s_results
                };

                new_s._select = Relation.prototype._select1.bind(new_s);

                return join(r_results, new_s, common_vars);
            };

            return this._andBothIndefinite(r, s, rel, and);
        }
    }, {
        key: 'and',
        value: function and(s) {
            return this._and(s, this._getCommonFreeVariables(s));
        }
    }, {
        key: 'or',
        value: function or(s) {
            var r = this,
                common_vars = r._getCommonFreeVariables(s),
                heading = Object.assign({}, r._heading, s._heading),
                rel = new Relation(heading);

            if (!common_vars.length) {
                rel.rule(function (params) {
                    if (Object.keys(params).length !== rel._degree) {
                        return INDEFINITE;
                    }

                    return [params];
                });

                return rel;
            }

            if (rel._degree === common_vars.length) {
                var _ruleFn = function _ruleFn(params) {
                    var r_results = r._select(params);
                    if (r_results === INDEFINITE) {
                        return r_results;
                    }

                    var s_results = s._select(params);
                    if (s_results === INDEFINITE) {
                        return s_results;
                    }

                    return union(r_results, s_results);
                };

                var results = _ruleFn({});

                if (results !== INDEFINITE) {
                    rel._body = results;
                } else {
                    rel.rule(_ruleFn);
                }

                return rel;
            }

            var uncommon_vars = [];

            for (var field in heading) {
                if (!common_vars.includes(field)) {
                    uncommon_vars.push(field);
                }
            }

            var ruleFn = function ruleFn(params) {
                var common_params = {};

                var _iteratorNormalCompletion12 = true;
                var _didIteratorError12 = false;
                var _iteratorError12 = undefined;

                try {
                    for (var _iterator12 = common_vars[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        var _field2 = _step12.value;

                        if (params.hasOwnProperty(_field2)) {
                            common_params[_field2] = params[_field2];
                        }
                    }
                } catch (err) {
                    _didIteratorError12 = true;
                    _iteratorError12 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }
                    } finally {
                        if (_didIteratorError12) {
                            throw _iteratorError12;
                        }
                    }
                }

                var _iteratorNormalCompletion13 = true;
                var _didIteratorError13 = false;
                var _iteratorError13 = undefined;

                try {
                    for (var _iterator13 = uncommon_vars[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                        var _field3 = _step13.value;

                        if (!params.hasOwnProperty(_field3)) {
                            return INDEFINITE;
                        }
                    }
                } catch (err) {
                    _didIteratorError13 = true;
                    _iteratorError13 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                        }
                    } finally {
                        if (_didIteratorError13) {
                            throw _iteratorError13;
                        }
                    }
                }

                var results = r._select(common_params);

                if (results === INDEFINITE || !results.length) {
                    results = s._select(common_params);
                    if (results === INDEFINITE) {
                        return results;
                    }

                    if (!results.length) {
                        return;
                    }
                }

                return results.map(function (tuple) {
                    return Object.assign(tuple, params);
                });
            };

            rel.rule(ruleFn);

            return rel;
        }
    }, {
        key: 'not',
        value: function not() {
            var _this2 = this;

            if (this._not_rel) {
                return clone(this._not_rel);
            }

            var rel = new Relation(this._heading);

            rel._not_rel = this;

            rel.rule(function (params) {
                var results = _this2._select(params);
                if (results === INDEFINITE) {
                    return results;
                }

                if (!results.length) {
                    return [params];
                }
            });

            return rel;
        }
    }, {
        key: 'rename',
        value: function rename(spec) {
            var _this3 = this;

            var heading = clone(this._heading);

            for (var field in spec) {
                var a = field,
                    b = spec[field];

                if (!this._heading[a]) {
                    throw Error('attribute name \'' + a + '\' is not in heading');
                }

                if (this._heading[b]) {
                    throw Error('attribute name \'' + b + '\' is already in heading');
                }

                heading[b] = heading[a];
                delete heading[a];
            }

            var rel = new Relation(heading);

            if (!this.size) {
                return rel;
            }

            var apply = function apply(body) {
                var new_body = [];

                var _iteratorNormalCompletion14 = true;
                var _didIteratorError14 = false;
                var _iteratorError14 = undefined;

                try {
                    for (var _iterator14 = body[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                        var tuple = _step14.value;

                        var new_tuple = clone(tuple);

                        for (var _field4 in spec) {
                            var _a = _field4,
                                _b = spec[_field4];

                            new_tuple[_b] = tuple[_a];
                            delete new_tuple[_a];
                        }

                        new_body.push(new_tuple);
                    }
                } catch (err) {
                    _didIteratorError14 = true;
                    _iteratorError14 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion14 && _iterator14.return) {
                            _iterator14.return();
                        }
                    } finally {
                        if (_didIteratorError14) {
                            throw _iteratorError14;
                        }
                    }
                }

                return new_body;
            };

            rel._body = apply(this._body);

            if (!this._indefinite) {
                return rel;
            }

            rel.rule(function (params) {
                var new_params = clone(params);

                for (var _field5 in spec) {
                    var _a2 = _field5,
                        _b2 = spec[_field5];

                    if (params.hasOwnProperty(_b2)) {
                        new_params[_a2] = params[_b2];
                        delete new_params[_b2];
                    }
                }

                var results = _this3._select(new_params);
                if (results === INDEFINITE) {
                    return results;
                }

                return apply(results);
            });

            return rel;
        }
    }, {
        key: 'remove',
        value: function remove(fields) {
            var _this4 = this;

            fields = new Set(fields);

            var heading = clone(this._heading);
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
                for (var _iterator15 = fields[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                    var field = _step15.value;
                    delete heading[field];
                }
            } catch (err) {
                _didIteratorError15 = true;
                _iteratorError15 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                        _iterator15.return();
                    }
                } finally {
                    if (_didIteratorError15) {
                        throw _iteratorError15;
                    }
                }
            }

            var rel = new Relation(heading);

            if (!rel._degree) {
                if (this.size) {
                    rel._body = [{}];
                }

                return rel;
            }

            var apply = function apply(body) {
                var new_body = [];

                var _iteratorNormalCompletion16 = true;
                var _didIteratorError16 = false;
                var _iteratorError16 = undefined;

                try {
                    for (var _iterator16 = body[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                        var tuple = _step16.value;

                        var new_tuple = clone(tuple);

                        var _iteratorNormalCompletion17 = true;
                        var _didIteratorError17 = false;
                        var _iteratorError17 = undefined;

                        try {
                            for (var _iterator17 = fields[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                var field = _step17.value;
                                delete new_tuple[field];
                            }
                        } catch (err) {
                            _didIteratorError17 = true;
                            _iteratorError17 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion17 && _iterator17.return) {
                                    _iterator17.return();
                                }
                            } finally {
                                if (_didIteratorError17) {
                                    throw _iteratorError17;
                                }
                            }
                        }

                        new_body.push(new_tuple);
                    }
                } catch (err) {
                    _didIteratorError16 = true;
                    _iteratorError16 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion16 && _iterator16.return) {
                            _iterator16.return();
                        }
                    } finally {
                        if (_didIteratorError16) {
                            throw _iteratorError16;
                        }
                    }
                }

                return new_body;
            };

            rel._body = apply(this._body);

            if (!this._indefinite) {
                return rel;
            }

            rel.rule(function (params) {
                var results = _this4._select(params);

                if (results === INDEFINITE) {
                    if (Object.keys(params).length === rel._degree) {
                        return [params];
                    }

                    return results;
                }

                return apply(results);
            });

            return rel;
        }
    }, {
        key: 'compose',
        value: function compose(s) {
            var r = this,
                common_vars = r._getCommonFreeVariables(s),
                anded_rel = r._and(s, common_vars);

            if (common_vars.length) {
                return anded_rel.remove(common_vars);
            }

            return anded_rel;
        }
    }, {
        key: 'tclose',
        value: function tclose() {
            if (this._degree !== 2) {
                throw Error('relation must be binary (degree of two)');
            }

            this._assertDefiniteSize();

            var rel = new Relation(this._heading);

            if (!this.size) {
                return rel;
            }

            var _Object$keys = Object.keys(this._heading);

            var _Object$keys2 = _slicedToArray(_Object$keys, 2);

            var a = _Object$keys2[0];
            var b = _Object$keys2[1];


            var apply = function apply(body) {
                var closures = [];

                var _iteratorNormalCompletion18 = true;
                var _didIteratorError18 = false;
                var _iteratorError18 = undefined;

                try {
                    for (var _iterator18 = body[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                        var tuple1 = _step18.value;
                        var _iteratorNormalCompletion19 = true;
                        var _didIteratorError19 = false;
                        var _iteratorError19 = undefined;

                        try {
                            for (var _iterator19 = body[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                                var tuple2 = _step19.value;

                                if (tuple1[a] === tuple2[b]) {
                                    var _closures$push;

                                    closures.push((_closures$push = {}, _defineProperty(_closures$push, a, tuple2[a]), _defineProperty(_closures$push, b, tuple1[b]), _closures$push));
                                }
                            }
                        } catch (err) {
                            _didIteratorError19 = true;
                            _iteratorError19 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion19 && _iterator19.return) {
                                    _iterator19.return();
                                }
                            } finally {
                                if (_didIteratorError19) {
                                    throw _iteratorError19;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError18 = true;
                    _iteratorError18 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion18 && _iterator18.return) {
                            _iterator18.return();
                        }
                    } finally {
                        if (_didIteratorError18) {
                            throw _iteratorError18;
                        }
                    }
                }

                var new_body = union(body, closures);

                if (new_body.length === body.length) {
                    return new_body;
                }

                return apply(new_body);
            };

            rel._body = apply(this._body);

            return rel;
        }
    }, {
        key: 'project',
        value: function project(fields) {
            fields = new Set(fields);

            var remove_fields = [];

            for (var field in this._heading) {
                if (!fields.has(field)) {
                    remove_fields.push(field);
                }
            }

            if (!remove_fields.length) {
                return clone(this);
            }

            return this.remove(remove_fields);
        }
    }, {
        key: 'heading',
        get: function get() {
            return clone(this._heading);
        }
    }, {
        key: 'degree',
        get: function get() {
            return this._degree;
        }
    }, {
        key: 'size',
        get: function get() {
            return this._indefinite ? INDEFINITE : this._body.length;
        }
    }]);

    return Relation;
}();

var equation = function equation(eq) {
    var variables = eq.split(/\W+/);

    var heading = {};
    var _iteratorNormalCompletion20 = true;
    var _didIteratorError20 = false;
    var _iteratorError20 = undefined;

    try {
        for (var _iterator20 = variables[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var variable = _step20.value;
            heading[variable] = Number;
        }
    } catch (err) {
        _didIteratorError20 = true;
        _iteratorError20 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion20 && _iterator20.return) {
                _iterator20.return();
            }
        } finally {
            if (_didIteratorError20) {
                throw _iteratorError20;
            }
        }
    }

    var rel = new Relation(heading);

    rel.rule(function (params) {
        var params_length = Object.keys(params).length;

        if (params_length < variables.length - 1) {
            return INDEFINITE;
        }

        var new_params = clone(params);

        var solve = function solve(unknown) {
            var new_eq = eq;

            for (var param in new_params) {
                new_eq = new_eq.replace(param, new_params[param]);
            }

            return algebra.parse(new_eq).solveFor(unknown).numer;
        };

        if (params_length === variables.length) {
            var unknown = variables[0];

            delete new_params[unknown];

            try {
                if (solve(unknown) === params[unknown]) {
                    return [params];
                }
            } catch (e) {}

            return;
        }

        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
            for (var _iterator21 = variables[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                var variable = _step21.value;

                if (!new_params.hasOwnProperty(variable)) {
                    var _unknown = variable;

                    try {
                        new_params[_unknown] = solve(_unknown);

                        return [new_params];
                    } catch (e) {
                        return;
                    }
                }
            }
        } catch (err) {
            _didIteratorError21 = true;
            _iteratorError21 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion21 && _iterator21.return) {
                    _iterator21.return();
                }
            } finally {
                if (_didIteratorError21) {
                    throw _iteratorError21;
                }
            }
        }
    });

    return rel;
};

var sqrt = new Relation({ x: Number, y: Number });

sqrt.rule(function (_ref) {
    var x = _ref.x;
    var y = _ref.y;

    if (x === undefined) {
        return [{ x: y * y }];
    }
    if (x < 0) {
        return;
    }

    var y1 = Math.sqrt(x),
        y2 = -y1;
    if (y && y !== y1 && y !== y2) {
        return;
    }

    return [{ y: y1 }, { y: y2 }];
});

var plus = equation('x + y = z'),
    subtract = equation('x - y = z'),
    multiply = equation('x * y = z'),
    divide = equation('x / y = z');

var comparison = function comparison(op) {
    var rel = new Relation({ x: Number, y: Number });

    rel.rule(function (params) {
        if (!params.hasOwnProperty('x') || !params.hasOwnProperty('y')) {
            return INDEFINITE;
        }

        return op(params.x, params.y);
    });

    return rel;
};

var gt = comparison(function (x, y) {
    return x > y;
}),
    gte = comparison(function (x, y) {
    return x >= y;
}),
    lt = comparison(function (x, y) {
    return x < y;
}),
    lte = comparison(function (x, y) {
    return x <= y;
});

var positive = gte.compose(new Relation(null, [{ y: 0 }]));
var negative = positive.not();

module.exports.Relation = Relation;
module.exports.equation = equation;
module.exports.sqrt = sqrt;
module.exports.plus = plus;
module.exports.subtract = subtract;
module.exports.multiply = multiply;
module.exports.divide = divide;
module.exports.gt = gt;
module.exports.gte = gte;
module.exports.lt = lt;
module.exports.lte = lte;
module.exports.positive = positive;
module.exports.negative = negative;