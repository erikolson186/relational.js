const assert = require('assert');
const clone = require('clone');
const algebra = require('algebra.js');

const INDEFINITE = Symbol.for('indefinite');

const union = (R, S) => {
    const body = [];

    for (let tuple of R._body) { body.push(tuple); }

    for (let s_tuple of S._body) {
        try {
            for (let tuple of body) {
                assert.notDeepEqual(s_tuple, tuple);
            }

            body.push(s_tuple);
        } catch (e) { }
    }

    return body;
};

const times = (R, S) => {
    const body = [];

    for (let r_tuple of R._body) {
        for (let s_tuple of S._body) {
            body.push(Object.assign(clone(r_tuple), clone(s_tuple)));
        }
    }

    return body;
};

const join = (R, S, attrs) => {
    const body = [];
    
    for (let r_tuple of R._body) {
        const params = {};
        for (let attr of attrs) { params[attr] = r_tuple[attr]; }
            
        const s_body = S._select(params);
        
        if (s_body === INDEFINITE) { return s_body; }

        for (let s_tuple of s_body) {
            body.push(Object.assign(clone(r_tuple), clone(s_tuple)));
        }
    }

    return body;
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
        if (this._body.length) {
            for (let i = 0; i < this._body.length; i++) {
                try {
                    assert.deepEqual(tuple, this._body[i]);

                    this._body.splice(i, 1);

                    return true;
                } catch (e) { }
            }
        }

        if (this._indefinite) {
            this._rule((params) => {
                try {
                    assert.deepEqual(tuple, params);

                    return false;
                } catch (e) { }
            });
        }

        return false;
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

            const set_bound_vars = (body) => {
                for (let tuple of body) {
                    for (let param in new_params) {
                        tuple[param] = new_params[param];
                    }
                }
            };

            const select_result = old_select(new_params);
            if (select_result === INDEFINITE) { return select_result; }

            set_bound_vars(select_result);

            let fn_result = fn(new_params);
            if (fn_result === INDEFINITE) { return fn_result; }
            if (!fn_result) { return select_result; }

            fn_result = fn_result === true ? [{}] : [...fn_result];

            set_bound_vars(fn_result);

            return union({ _body: select_result }, { _body: fn_result });
        };
    }

    toBoolean() {
        return this._indefinite || this._body.length > 0;
    }

    _getCommonFreeVariables(S) {
        const common_vars = [];

        for (let attr in this._heading) {
            if (S._heading[attr]) {
                if (this._heading[attr] !== S._heading[attr]) {
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

    _and(S, common_vars) {
        const R = this;

        const heading = Object.assign({}, R._heading, S._heading);

        const rel = new Relation(heading);

        if (!R.size || !S.size) { return rel; }

        const rule = (params) => {
            const r_params = {}, s_params = {};
            let r_params_length = 0, s_params_length = 0;

            for (let param in params) {
                if (R._heading[param]) {
                    r_params[param] = params[param];
                    r_params_length++;
                }

                if (S._heading[param]) {
                    s_params[param] = params[param];
                    s_params_length++;
                }
            }

            const new_r_body = R._select(r_params_length ? r_params : null);
            if (new_r_body === INDEFINITE) { return new_r_body; }
            if (!new_r_body.length) { return; }

            const new_s_body = S._select(s_params_length ? s_params : null);
            if (new_s_body === INDEFINITE) { return new_s_body; }
            if (!new_s_body.length) { return; }

            return and({ _body: new_r_body }, { _body: new_s_body });
        };

        if (common_vars.length) {
            const fn = (R, S) => {
                const body = join(R, S, common_vars);

                if (body === INDEFINITE) {
                    rel._rule((params) => {
                        const new_common_vars = new Set(common_vars);

                        for (let attr in heading) {
                            if (params.hasOwnProperty(attr)) {
                                new_common_vars.add(attr);
                            }
                        }

                        const new_r = { _body: times(R, { _body: [params] }) };
                        return join(new_r, S, new_common_vars);
                    });
                } else { rel._body = body; }

                return rel;
            };

            if (R._indefinite) {
                if (!S._indefinite) { return fn(S, R); }

                var and = (new_r, new_s) => {
                    new_s._heading = S._heading;
                    new_s._select = Relation.prototype._select.bind(new_s);

                    return join(new_r, new_s, common_vars);
                };

                rel._rule(rule);

                return rel;
            }

            return fn(R, S);
        }

        var and = times;

        const body = rule();

        if (body !== INDEFINITE) {
            if (body) { rel._body = body; }
        } else { rel._rule(rule); }

        return rel;
    }

    and(S) {
        return this._and(S, this._getCommonFreeVariables(S));
    }

    or(S) {
        const R = this;

        const common_vars = R._getCommonFreeVariables(S);
        
        const heading = Object.assign({}, R._heading, S._heading);

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
            const rule = (params) => {
                const r_body = R._select(params);
                if (r_body === INDEFINITE) { return r_body; }

                const s_body = S._select(params);
                if (s_body === INDEFINITE) { return s_body; }

                return union({ _body: r_body }, { _body: s_body });
            };

            const body = rule();

            if (body !== INDEFINITE) { rel._body = body; } 
            else { rel._rule(rule); }

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

            let results = R._select(common_params);

            if (results === INDEFINITE || !results.length) {
                results = S._select(common_params);

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

                const body = this._select(new_params);
                if (body === INDEFINITE) { return body; }

                return fn(body);
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
                const body = this._select(params);

                if (body === INDEFINITE) {
                    if (Object.keys(params).length === rel._degree) {
                        return [params];
                    }

                    return body;
                }

                return fn(body);
            });
        }

        return rel;
    }

    compose(S) {
        const R = this, common_vars = R._getCommonFreeVariables(S);

        const anded_rel = R._and(S, common_vars);

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

            const new_body = union({ _body: body }, { _body: closures });

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