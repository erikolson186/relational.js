const assert = require('assert');
const clone = require('clone');
const algebra = require('algebra.js');

const INDEFINITE = Symbol.for('indefinite');

const union = (r, s) => {
    const results = [];

    for (let tuple of r) { results.push(tuple); }

    for (let s_tuple of s) {
        try {
            for (let tuple of results) {
                assert.notDeepEqual(s_tuple, tuple);
            }

            results.push(s_tuple);
        } catch (e) { }
    }

    return results;
};

const times = (r, s) => {
    const results = [];

    for (let r_tuple of r) {
        for (let s_tuple of s) {
            results.push(Object.assign(clone(r_tuple), clone(s_tuple)));
        }
    }

    return results;
};

const join = (r, s, attrs) => {
    const results = [];

    for (let r_tuple of r) {
        const params = {};
        for (let attr of attrs) { params[attr] = r_tuple[attr]; }

        const s_results = s._select(params);
        if (s_results === INDEFINITE) { return s_results; }

        for (let s_tuple of s_results) {
            results.push(Object.assign(clone(r_tuple), clone(s_tuple)));
        }
    }

    return results;
};

class Relation {
    constructor(heading, body, rule_fn) {
        this._indefinite = false;
        this._body = [];

        if (rule_fn) { this._rule(rule_fn); }

        if (heading) {
            this._heading = heading;
            this._degree = Object.keys(heading).length;

            for (let attr in heading) {
                const type = heading[attr];

                if (type === undefined || type === null) {
                    throw Error(`heading attribute '${attr}' type is ${type}`);
                }
            }

            if (!body) { return; }
        } else {
            this._heading = {};
            this._degree = 0;

            if (!body) { return; }

            const tuple = body.shift();

            if (tuple) {
                for (let attr in tuple) {
                    const type = tuple[attr]; 

                    if (type === undefined || type === null) {
                        throw Error(`attribute '${attr}' type is ${type}`);
                    }

                    this._heading[attr] = type.constructor;
                    this._degree++;
                }

                if (!this._degree) { return; }
                
                if (!this.has(tuple)) { this._body.push(tuple); }
            }
        }

        if (this._degree) {
            for (let tuple of body) { this.add(tuple); }
        }
    }

    get heading() { return clone(this._heading); }
    get degree() { return this._degree; }
    
    get size() {
        return this._indefinite ? INDEFINITE : this._body.length;
    }

    [Symbol.iterator]() { return this.values(); }

    add(tuple) {
        if (!this._degree) { return this; }
        
        const new_tuple = {};

        for (let attr in this._heading) {
            if (!tuple.hasOwnProperty(attr)) {
                throw Error(`tuple is missing attribute '${attr}'`);
            }

            const attr_type = tuple[attr];

            if (attr_type === undefined || attr_type === null) {
                throw Error(`attribute '${attr}' is ${attr_type}`);
            }

            if (attr_type.constructor !== this._heading[attr]) {
                const type = this._heading[attr].name;

                throw Error(`attribute '${attr}' must be of type ${type}`);
            }

            new_tuple[attr] = tuple[attr];
        }

        if (!this.has(new_tuple)) { this._body.push(new_tuple); }

        return this;
    }

    delete(tuple) {
        let found_it = false;

        if (this._indefinite && this._rule_fn(tuple)) {
            found_it = true;
            
            this._rule((params) => {
                try {
                    assert.deepEqual(tuple, params);

                    return false;
                } catch (e) { }
            });
        }

        if (this._body.length) {
            for (let i = 0; i < this._body.length; i++) {
                try {
                    assert.deepEqual(tuple, this._body[i]);

                    found_it = true;

                    this._body.splice(i, 1);

                    break;
                } catch (e) { }
            }
        }

        return found_it;
    }

    entries() {
        const values_it = this.values();

        const entries = [][Symbol.iterator]();

        entries.next = () => {
            const obj = values_it.next();

            if (obj.value) {
                obj.value = [obj.value, obj.value];
            }

            return obj;
        };

        return entries;
    }

    forEach(fn, this_arg) {
        for (let tuple of this.values()) {
            fn.call(this_arg, tuple);
        }
    }

    has(tuple) {
        const body = this._select(tuple);

        if (body._indefinite || body[0]) { return true; }

        return false;
    }

    keys() { return this.values(); }

    values() {
        this._assertDefiniteSize();

        return this._body[Symbol.iterator]();
    }

    _select(params) {
        if (!params) { return clone(this._body); }

        const attrs = [];

        for (let attr in params) {
            if (this._heading[attr]) { attrs.push(attr); }
        }
        
        const body = [];

        if (!attrs.length) { return body; }

        this._body.forEach((tuple) => {
            for (let attr of attrs) {
                try {
                    assert.deepEqual(tuple[attr], params[attr]);
                } catch (e) { return; }
            }

            body.push(clone(tuple));
        });

        return body;
    }

    _rule(fn) { 
        this._indefinite = true;
        this._rule_fn = fn;

        const old_select = this._select.bind(this);

        this._select = (params) => {
            const new_params = {};

            if (params) {
                for (let param in params) {
                    if (this._heading[param]) {
                        new_params[param] = params[param];
                    }
                }
            }

            const select_results = old_select(new_params);
            if (select_results === INDEFINITE) { return select_results; }

            let fn_results = fn(new_params);
            if (fn_results === INDEFINITE) { return fn_results; }
            if (!fn_results) { return select_results; }

            fn_results = fn_results === true ? [{}] : [...fn_results];

            for (let tuple of fn_results) {
                for (let param in new_params) {
                    tuple[param] = new_params[param];
                }
            }

            return union(select_results, fn_results);
        };
    }

    toBoolean() {
        return this._indefinite || this._body.length > 0;
    }

    _getCommonFreeVariables(s) {
        const common_vars = [];

        for (let attr in this._heading) {
            if (s._heading[attr]) {
                if (this._heading[attr] !== s._heading[attr]) {
                    throw Error(`type mismatch for attribute '${attr}'`);
                }

                common_vars.push(attr);
            }
        }

        return common_vars;
    }

    _assertDefiniteSize() {
        if (this._indefinite) {
            throw Error('relation must have a definite cardinality');
        }
    }

    _and(s, common_vars) {
        const r = this;

        const heading = Object.assign({}, r._heading, s._heading);

        const rel = new Relation(heading);

        if (!r.size || !s.size) { return rel; }

        const rule_fn = (params) => {
            const r_params = {}, s_params = {};
            let r_params_length = 0, s_params_length = 0;

            for (let param in params) {
                if (r._heading[param]) {
                    r_params[param] = params[param];
                    r_params_length++;
                }

                if (s._heading[param]) {
                    s_params[param] = params[param];
                    s_params_length++;
                }
            }

            let r_results;

            if (r_params.length) {
                r_results = r._select(r_params);
                if (r_results === INDEFINITE) { return r_results; }
            } else { r_results = r._select(); }

            if (!r_results.length) { return; }

            let s_results;

            if (s_params.length) {
                s_results = s._select(s_params);
                if (s_results === INDEFINITE) { return s_results; }
            } else { s_results = s._select(); }

            if (!s_results.length) { return; }

            return and(r_results, s_results);
        };

        if (common_vars.length) {
            const fn = (r, s) => {
                const results = join(r._body, s, common_vars);

                if (results === INDEFINITE) {
                    rel._rule((params) => {
                        const new_common_vars = new Set(common_vars);

                        for (let attr in heading) {
                            if (params.hasOwnProperty(attr)) {
                                new_common_vars.add(attr);
                            }
                        }

                        return join(times(r, [params]), s, new_common_vars);
                    });
                } else { rel._body = results; }

                return rel;
            };

            if (r._indefinite) {
                if (!s._indefinite) { return fn(s, r); }

                var and = (r_results, s_results) => {
                    const new_s = {
                        _heading: s._heading,
                        _body: s_results,
                        _select: Relation.prototype._select.bind(new_s)
                    };

                    return join(r_results, new_s, common_vars);
                };

                rel._rule(rule_fn);

                return rel;
            }

            return fn(r, s);
        }

        var and = times;

        const results = rule_fn();

        if (results !== INDEFINITE) {
            if (results) { rel._body = results; }
        } else { rel._rule(rule_fn); }

        return rel;
    }

    and(s) {
        return this._and(s, this._getCommonFreeVariables(s));
    }

    or(s) {
        const r = this;

        const common_vars = r._getCommonFreeVariables(s);
        
        const heading = Object.assign({}, r._heading, s._heading);

        const rel = new Relation(heading);

        if (!common_vars.length) {
            rel._rule((params) => {
                if (Object.keys(params).length !== rel._degree) {
                    return INDEFINITE;
                }

                return [params];
            });

            return rel;
        }

        if (rel._degree === common_vars.length) {
            const rule_fn = (params) => {
                const r_results = r._select(params);
                if (r_results === INDEFINITE) { return r_results; }

                const s_results = s._select(params);
                if (s_results === INDEFINITE) { return s_results; }

                return union(r_results, s_results);
            };

            const results = rule_fn();

            if (results !== INDEFINITE) { rel._body = results; } 
            else { rel._rule(rule_fn); }

            return rel;
        }

        const uncommon_vars = [];

        for (let attr in heading) {
            if (!common_vars.includes(attr)) { uncommon_vars.push(attr); }
        }

        rel._rule((params) => {
            const common_params = {};
            
            for (let attr of common_vars) {
                if (params.hasOwnProperty(attr)) {
                    common_params[attr] = params[attr];
                }
            }

            for (let attr of uncommon_vars) {
                if (!params.hasOwnProperty(attr)) { return INDEFINITE; }
            }

            let results = r._select(common_params);

            if (results === INDEFINITE || !results.length) {
                results = s._select(common_params);

                if (results === INDEFINITE) { return results; }
                if (!results.length) { return; }
            }

            return results.map(tuple => Object.assign(tuple, params));
        });

        return rel;
    }

    not() {
        if (this._not_rel) { return clone(this._not_rel); }

        const rel = new Relation(this._heading);

        rel._not_rel = this;

        rel._rule((params) => {
            const params_length = Object.keys(params).length;
            if (this._degree !== params_length) { return INDEFINITE; }

            if (!this._select(params)[0]) { return [params]; }
        });

        return rel;
    }

    rename(obj) {
        const heading = clone(this._heading);

        for (let attr in obj) {
            const a = attr, b = obj[attr];

            if (!this._heading[a]) {
                throw Error(`attribute name '${a}' is not in heading`);
            }

            if (this._heading[b]) {
                throw Error(`attribute name '${b}' is already in heading`);
            }

            heading[b] = heading[a];
            delete heading[a];
        }

        const rel = new Relation(heading);

        if (!this.size) { return rel; }

        const fn = (body) => {
            const new_body = [];

            for (let tuple of body) {
                const new_tuple = clone(tuple);

                for (let attr in obj) {
                    const a = attr, b = obj[attr];

                    new_tuple[b] = tuple[a];
                    delete new_tuple[a];
                }

                new_body.push(new_tuple);
            }

            return new_body;
        };

        rel._body = fn(this._body);

        if (this._indefinite) {
            rel._rule((params) => {
                const new_params = clone(params);

                for (let attr in obj) {
                    const a = attr, b = obj[attr];

                    if (params.hasOwnProperty(b)) {
                        new_params[a] = params[b];
                        delete new_params[b];
                    }
                }

                const results = this._select(new_params);
                if (results === INDEFINITE) { return results; }

                return fn(results);
            });
        }

        return rel;
    }

    remove(attrs) {
        attrs = new Set(attrs);

        const heading = clone(this._heading);
        for (let attr of attrs) { delete heading[attr]; }

        const rel = new Relation(heading);

        if (!rel._degree) {
            if (this.size) { rel._body = [{ }]; }

            return rel;
        }

        const fn = (body) => {
            const new_body = [];

            for (let tuple of body) {
                const new_tuple = clone(tuple);
                for (let attr of attrs) { delete new_tuple[attr]; }

                new_body.push(new_tuple);
            }

            return new_body;
        };

        rel._body = fn(this._body);

        if (this._indefinite) {
            rel._rule((params) => {
                const results = this._select(params);

                if (results === INDEFINITE) {
                    if (Object.keys(params).length === rel._degree) {
                        return [params];
                    }

                    return results;
                }

                return fn(results);
            });
        }

        return rel;
    }

    compose(s) {
        const r = this, common_vars = r._getCommonFreeVariables(s);

        const anded_rel = r._and(s, common_vars);

        if (common_vars.length) { return anded_rel.remove(common_vars); }

        return anded_rel;
    }

    tclose() {
        if (this._degree !== 2) {
            throw Error('relation must be binary (degree of two)');
        }

        this._assertDefiniteSize();

        const rel = new Relation(this._heading);

        if (!this.size) { return rel; }

        const [a, b] = Object.keys(this._heading);

        const fn = (body) => {
            const closures = [];

            for (let tuple1 of body) {
                for (let tuple2 of body) {
                    if (tuple1[a] === tuple2[b]) {
                        closures.push({ [a]: tuple2[a], [b]: tuple1[b] });
                    }
                }
            }

            const new_body = union(body, closures);

            if (new_body.length === body.length) { return new_body; }

            return fn(new_body);
        };

        rel._body = fn(this._body);

        return rel;
    }

    project(attrs) {
        attrs = new Set(attrs);

        const remove_attrs = [];

        for (let attr in this._heading) {
            if (!attrs.has(attr)) { remove_attrs.push(attr); }
        }

        if (!remove_attrs.length) { return clone(this); }

        return this.remove(remove_attrs);
    }
}

const equation = (eq) => {
    const variables = eq.split(/\W+/);

    const heading = {};
    for (let variable of variables) { heading[variable] = Number; }

    const rel = new Relation(heading);

    rel._rule((params) => {
        const params_length = Object.keys(params).length;

        if (params_length < variables.length - 1) {
            return INDEFINITE;
        }

        const new_params = clone(params);

        const solve = (unknown) => {
            let new_eq = eq;

            for (let param in new_params) {
                new_eq = new_eq.replace(param, new_params[param]);
            }

            return algebra.parse(new_eq).solveFor(unknown).numer;
        };

        if (params_length === variables.length) {
            const unknown = variables[0];

            delete new_params[unknown];

            try {
                if (solve(unknown) === params[unknown]) {
                    return [params];
                }
            } catch (e) { }
        } else {
            for (let variable of variables) {
                if (!new_params.hasOwnProperty(variable)) {
                    const unknown = variable;

                    try {
                        new_params[unknown] = solve(unknown);

                        return [new_params];
                    } catch (e) { return; }
                }
            }
        }
    });

    return rel;
};

const sqrt = new Relation({ x: Number, y: Number });

sqrt._rule(({ x, y }) => {    
    if (x === undefined) { return [{ x: y * y }]; }
    
    if (x < 0) { return; }

    const y1 = Math.sqrt(x), y2 = -y1;
    if (y && y !== y1 && y !== y2) { return; }

    return [{ y: y1 }, { y: y2 }];
});

const plus = equation('x + y = z');
const subtract = equation('x - y = z');
const multiply = equation('x * y = z');
const divide = equation('x / y = z');

const comparison = (op) => {
    const rel = new Relation({ x: Number, y: Number });

    rel._rule((params) => {
        if (!params.hasOwnProperty('x') || 
            !params.hasOwnProperty('y')) {
            return INDEFINITE;
        }

        return op(params.x, params.y);
    });

    return rel;
};

const gt = comparison((x, y) => x > y);
const gte = comparison((x, y) => x >= y);
const lt = comparison((x, y) => x < y);
const lte = comparison((x, y) => x <= y);

const positive = gte.compose(new Relation(null, [{ y: 0 }]));
const negative = positive.not();

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