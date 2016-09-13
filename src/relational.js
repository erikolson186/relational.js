const deepEqual = require('deep-equal'),
      clone = require('clone'),
      algebra = require('algebra.js');

const INDEFINITE = Symbol.for('indefinite');

const union = (r, s) => {
    const results = [...r];

    const fn = (s_tuple) => {
        for (let tuple of results) {
            if (deepEqual(s_tuple, tuple)) { return; }
        }

        results.push(s_tuple);
    };

    for (let s_tuple of s) { fn(s_tuple); }

    return results;
};

const _add = (results, r_tuple, s_tuple) => {
    results.push(Object.assign(clone(r_tuple), clone(s_tuple)));
};

const times = (r, s) => {
    const results = [];

    for (let r_tuple of r) {
        for (let s_tuple of s) {
            _add(results, r_tuple, s_tuple);
        }
    }

    return results;
};

const join = (r, s, fields) => {
    const results = [];

    for (let r_tuple of r) {
        const params = {};
        for (let field of fields) { params[field] = r_tuple[field]; }

        const s_results = s._select(params);
        if (s_results === INDEFINITE) { return s_results; }

        for (let s_tuple of s_results) {
            _add(results, r_tuple, s_tuple);
        }
    }

    return results;
};

class Relation {
    constructor(heading, body, ruleFn) {
        this._indefinite = false;
        this._degree = 0;
        this._body = [];
        this._select = this._select1;

        if (ruleFn) { this.rule(ruleFn); }

        const addBody = () => {
            for (let tuple of body) { this.add(tuple); }
        };

        if (!heading) {
            this._heading = {};

            if (!body || !body[0]) { return; }

            const tuple = body.shift();

            for (let field in tuple) {
                const type = tuple[field];

                if (type == null) {
                    throw Error(`attribute '${field}' type is ${type}`);
                }

                this._heading[field] = type.constructor;
                this._degree++;
            }

            if (!this._degree) { return; }
            if (!this.has(tuple)) { this._body.push(tuple); }

            return addBody();
        }

        this._heading = heading;

        for (let field in heading) {
            const type = heading[field];

            if (type == null) {
                throw Error(`heading attribute '${field}' type is ${type}`);
            }

            this._degree++;
        }

        if (this._degree && body) { return addBody(); }
    }

    get heading() { return clone(this._heading); }
    get degree() { return this._degree; }

    get size() {
        return this._indefinite ? INDEFINITE : this._body.length;
    }

    [Symbol.iterator]() { return this.values(); }

    add(tuple) {
        if (!this._degree) { return this; }

        for (let field in this._heading) {
            if (!tuple.hasOwnProperty(field)) {
                throw Error(`tuple is missing attribute '${field}'`);
            }

            const field_type = tuple[field];

            if (field_type == null) {
                throw Error(`attribute '${field}' is ${field_type}`);
            }

            if (field_type.constructor !== this._heading[field]) {
                const type = this._heading[field].name;

                throw Error(`attribute '${field}' must be of type ${type}`);
            }
        }

        if (!this.has(tuple)) { this._body.push(clone(tuple)); }

        return this;
    }

    delete(tuple) {
        let found_it = false;

        if (this._indefinite && this._ruleFn(tuple)) {
            found_it = true;

            this.rule(params => !deepEqual(tuple, params));
        }

        for (let i = 0; i < this._body.length; i++) {
            if (deepEqual(tuple, this._body[i])) {
                found_it = true;

                this._body.splice(i, 1);

                break;
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
        const results = this._select(tuple);

        if (results === INDEFINITE || results.length) { return true; }

        return false;
    }

    keys() { return this.values(); }

    values() {
        this._assertDefiniteSize();

        return this._body[Symbol.iterator]();
    }

    _select1(params) {
        const fields = Object.keys(params);
        if (!fields.length) { return clone(this._body); }

        const results = [];

        this._body.forEach((tuple) => {
            for (let field of fields) {
                if (!deepEqual(tuple[field], params[field])) {
                    return;
                }
            }

            results.push(clone(tuple));
        });

        return results;
    }

    _select2(params) {
        const select_results = this._select1(params);
        if (select_results === INDEFINITE) { return select_results; }

        let fn_results = this._ruleFn(params);
        if (fn_results === INDEFINITE) { return fn_results; }
        if (!fn_results) { return select_results; }

        fn_results = fn_results === true ? [{}] : [...fn_results];

        for (let tuple of fn_results) {
            for (let param in params) {
                tuple[param] = params[param];
            }
        }

        return union(select_results, fn_results);
    }

    rule(fn) {
        this._indefinite = true;
        this._ruleFn = fn;
        this._select = this._select2;
    }

    toBoolean() {
        return this._indefinite || this._body.length > 0;
    }

    _getCommonFreeVariables(s) {
        const common_vars = [];

        for (let field in this._heading) {
            if (s._heading[field]) {
                if (this._heading[field] !== s._heading[field]) {
                    throw Error(`type mismatch for attribute '${field}'`);
                }

                common_vars.push(field);
            }
        }

        return common_vars;
    }

    _assertDefiniteSize() {
        if (this._indefinite) {
            throw Error('relation must have a definite cardinality');
        }
    }

    _andOneIndefinite(r, s, common_vars, rel) {
        const results = join(r, s, common_vars);

        if (results === INDEFINITE) {
            rel.rule((params) => {
                const new_common_vars = new Set(common_vars);

                for (let field in rel.heading) {
                    if (params.hasOwnProperty(field)) {
                        new_common_vars.add(field);
                    }
                }

                return join(times(r, [params]), s, new_common_vars);
            });
        } else { rel._body = results; }

        return rel;
    }

    _andAnyIndefinite(r, s, rel, and) {
        const ruleFn = (params) => {
            const r_params = {}, s_params = {};

            for (let param in params) {
                if (r._heading[param]) {
                    r_params[param] = params[param];
                }

                if (s._heading[param]) {
                    s_params[param] = params[param];
                }
            }

            const r_results = r._select(r_params);
            if (r_results === INDEFINITE) { return r_results; }
            if (!r_results.length) { return; }

            const s_results = s._select(s_params);
            if (s_results === INDEFINITE) { return s_results; }
            if (!s_results.length) { return; }

            return and(r_results, s_results);
        };

        rel.rule(ruleFn);

        return rel;
    }

    _and(s, common_vars) {
        const r = this,
              heading = Object.assign({}, r._heading, s._heading),
              rel = new Relation(heading);

        if (!r.size || !s.size) { return rel; }

        if (!common_vars.length) {
            if (!r._indefinite && !s._indefinite) {
                const results = times(r, s);

                rel._body = results;

                return rel;
            }

            return this._andAnyIndefinite(r, s, rel, times);
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

        const and = (r_results, s_results) => {
            const new_s = {
                _heading: s._heading,
                _body: s_results
            };

            new_s._select = Relation.prototype._select1.bind(new_s);

            return join(r_results, new_s, common_vars);
        };

        return this._andAnyIndefinite(r, s, rel, and);
    }

    and(s) {
        return this._and(s, this._getCommonFreeVariables(s));
    }

    or(s) {
        const r = this,
              common_vars = r._getCommonFreeVariables(s),
              heading = Object.assign({}, r._heading, s._heading),
              rel = new Relation(heading);

        if (!common_vars.length) {
            rel.rule((params) => {
                if (Object.keys(params).length !== rel._degree) {
                    return INDEFINITE;
                }

                return [params];
            });

            return rel;
        }

        if (rel._degree === common_vars.length) {
            const ruleFn = (params) => {
                const r_results = r._select(params);
                if (r_results === INDEFINITE) { return r_results; }

                const s_results = s._select(params);
                if (s_results === INDEFINITE) { return s_results; }

                return union(r_results, s_results);
            };

            const results = ruleFn({});

            if (results !== INDEFINITE) { rel._body = results; }
            else { rel.rule(ruleFn); }

            return rel;
        }

        const uncommon_vars = [];

        for (let field in heading) {
            if (!common_vars.includes(field)) {
                uncommon_vars.push(field);
            }
        }

        const ruleFn = (params) => {
            const common_params = {};

            for (let field of common_vars) {
                if (params.hasOwnProperty(field)) {
                    common_params[field] = params[field];
                }
            }

            for (let field of uncommon_vars) {
                if (!params.hasOwnProperty(field)) {
                    return INDEFINITE;
                }
            }

            let results = r._select(common_params);

            if (results === INDEFINITE || !results.length) {
                results = s._select(common_params);
                if (results === INDEFINITE) { return results; }

                if (!results.length) { return; }
            }

            return results.map((tuple) => {
                return Object.assign(tuple, params);
            });
        };

        rel.rule(ruleFn);

        return rel;
    }

    not() {
        if (this._not_rel) { return clone(this._not_rel); }

        const rel = new Relation(this._heading);

        rel._not_rel = this;

        rel.rule((params) => {
            const results = this._select(params);
            if (results === INDEFINITE) { return results; }

            if (!results.length) { return [params]; }
        });

        return rel;
    }

    rename(spec) {
        const heading = clone(this._heading);

        for (let field in spec) {
            const a = field, b = spec[field];

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

        const apply = (body) => {
            const new_body = [];

            for (let tuple of body) {
                const new_tuple = clone(tuple);

                for (let field in spec) {
                    const a = field, b = spec[field];

                    new_tuple[b] = tuple[a];
                    delete new_tuple[a];
                }

                new_body.push(new_tuple);
            }

            return new_body;
        };

        rel._body = apply(this._body);

        if (!this._indefinite) { return rel; }

        rel.rule((params) => {
            const new_params = clone(params);

            for (let field in spec) {
                const a = field, b = spec[field];

                if (params.hasOwnProperty(b)) {
                    new_params[a] = params[b];
                    delete new_params[b];
                }
            }

            const results = this._select(new_params);
            if (results === INDEFINITE) { return results; }

            return apply(results);
        });

        return rel;
    }

    remove(fields) {
        fields = new Set(fields);

        const heading = clone(this._heading);
        for (let field of fields) { delete heading[field]; }

        const rel = new Relation(heading);

        if (!rel._degree) {
            if (this.size) { rel._body = [{}]; }

            return rel;
        }

        const apply = (body) => {
            const new_body = [];

            for (let tuple of body) {
                const new_tuple = clone(tuple);

                for (let field of fields) { delete new_tuple[field]; }

                new_body.push(new_tuple);
            }

            return new_body;
        };

        rel._body = apply(this._body);

        if (!this._indefinite) { return rel; }

        rel.rule((params) => {
            const results = this._select(params);

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

    compose(s) {
        const r = this,
              common_vars = r._getCommonFreeVariables(s),
              anded_rel = r._and(s, common_vars);

        if (common_vars.length) {
            return anded_rel.remove(common_vars);
        }

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

        const apply = (body) => {
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

            return apply(new_body);
        };

        rel._body = apply(this._body);

        return rel;
    }

    project(fields) {
        fields = new Set(fields);

        const remove_fields = [];

        for (let field in this._heading) {
            if (!fields.has(field)) {
                remove_fields.push(field);
            }
        }

        if (!remove_fields.length) { return clone(this); }

        return this.remove(remove_fields);
    }
}

const equation = (eq) => {
    const variables = eq.split(/\W+/);

    const heading = {};
    for (let variable of variables) { heading[variable] = Number; }

    const rel = new Relation(heading);

    rel.rule((params) => {
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

            return;
        }

        for (let variable of variables) {
            if (!new_params.hasOwnProperty(variable)) {
                const unknown = variable;

                try {
                    new_params[unknown] = solve(unknown);

                    return [new_params];
                } catch (e) { return; }
            }
        }
    });

    return rel;
};

const sqrt = new Relation({ x: Number, y: Number });

sqrt.rule(({ x, y }) => {
    if (x === undefined) { return [{ x: y * y }]; }
    if (x < 0) { return; }

    const y1 = Math.sqrt(x), y2 = -y1;
    if (y && y !== y1 && y !== y2) { return; }

    return [{ y: y1 }, { y: y2 }];
});

const plus = equation('x + y = z'),
      subtract = equation('x - y = z'),
      multiply = equation('x * y = z'),
      divide = equation('x / y = z');

const comparison = (op) => {
    const rel = new Relation({ x: Number, y: Number });

    rel.rule((params) => {
        if (!params.hasOwnProperty('x') ||
            !params.hasOwnProperty('y')) {
            return INDEFINITE;
        }

        return op(params.x, params.y);
    });

    return rel;
};

const gt = comparison((x, y) => x > y),
      gte = comparison((x, y) => x >= y),
      lt = comparison((x, y) => x < y),
      lte = comparison((x, y) => x <= y);

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
