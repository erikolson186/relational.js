const expect = require('chai').expect;
const clone = require('clone');

const {
    Relation,
    sqrt,
    plus,
    subtract,
    multiply,
    divide,
    gt,
    gte,
    lt,
    lte,
    positive,
    negative
} = require('../relational.js');

const INDEFINITE = Symbol.for('indefinite');

describe('Relation', () => {
    describe('.insert', () => {
        it('should insert tuple into body', () => {
            const r = new Relation({ x: Number, k: Number });

            const tuple = { x: 4, k: 8 };

            r.add(tuple);

            expect(r.size).to.equal(1);
            expect([...r]).to.deep.equal([tuple]);
        });

        it('should work with tuples as values', () => {
            const r = new Relation({ obj: Object });

            const tuple = { obj: { x: 4 } };

            r.add(tuple);

            expect(r.size).to.equal(1);
            expect([...r]).to.deep.equal([tuple]);
        });

        it('should work with relations as values', () => {
            class Person extends Relation {
                constructor(...args) {
                    super({ name: String, age: Number }, ...args);
                }
            }

            const r = new Relation({ x: Number, p: Person });
            
            const p = new Person([{ name: 'Thomas', age: 59 }]);
            const tuple = { x: 4, p };

            r.add(tuple);

            expect(r.size).to.equal(1);
            expect([...r]).to.deep.equal([tuple]);
        });
    });

    describe('.delete', () => {
        it('should delete tuple from definite body', () => {
            const tuple1 = { d: 3.0 }, tuple2 = { d: 4.8 };

            const r = new Relation(null, [tuple1, tuple2]);

            r.delete(tuple2);

            expect(r.size).to.equal(1);
            expect([...r]).to.deep.equal([tuple1]);

            const tuple3 = { obj: { x: 3 } };

            const s = new Relation(null, [tuple3]);

            s.delete(tuple3);

            expect(s.size).to.equal(0);
            expect([...s]).to.deep.equal([]);
        });

        it('should delete tuple from indefinite body', () => {
            const new_plus = clone(plus);

            const tuple = { x: 4, y: 2, z: 6 };

            new_plus.delete(tuple);
            expect(new_plus.has(tuple)).to.be.false;
        });
    });

    describe('.toBoolean', () => {
        it('should return true for relation when cardinality > 0', () => {
            const person = new Relation(null, [{ name: 'Jack', age: 30 }]);
            expect(person.toBoolean()).to.be.true;
        });

        it('should return false for relation when cardinality <= 0', () => {
            expect((new Relation()).toBoolean()).to.be.false;
        });
    });

    describe('.and', () => {
        it('should perform the natural join when common vars', () => {
            const tuple1 = { name: 'Thomas', age: 30 };
            const tuple2 = { name: 'Jack', age: 44 };

            const person = new Relation(null, [tuple1, tuple2]);

            const tuple3 = { name: 'Thomas', position: 'programmer' };
            const tuple4 = { name: 'Jack', position: 'manager' };

            const employee = new Relation(null, [tuple3, tuple4]);

            const someone = person.and(employee);

            const tuple5 = Object.assign({}, tuple1, tuple3);
            expect(someone.has(tuple5)).to.be.true;

            const tuple6 = Object.assign({}, tuple2, tuple4);
            expect(someone.has(tuple6)).to.be.true;
        });

        it('should perform the times when headers are disjoint', () => {
            const r = new Relation(null, [{ x: 4 }, { x: 6 }]);
            const s = new Relation(null, [{ g: 3 }, { g: 8 }]);
            
            const g = r.and(s);

            expect(g.has({ x: 4, g: 3 })).to.be.true;
            expect(g.has({ x: 4, g: 8 })).to.be.true;
            expect(g.has({ x: 6, g: 3 })).to.be.true;
            expect(g.has({ x: 6, g: 8 })).to.be.true;
        });
    });

    describe('.or', () => {
        it('should perform the union when headers are equal', () => {
            const tuple1 = { make: 'Ford', model: 'F-150', year: 2016 };
            const truck = new Relation(null, [tuple1]);

            const tuple2 = { make: 'Ford', model: 'Mustang', year: 2015 };
            const car = new Relation(null, [tuple2]);

            const vehicle = truck.or(car);

            expect(vehicle.has(tuple1)).to.be.true;
            expect(vehicle.has(tuple2)).to.be.true;
        });

        it('should return relation with any value for uncommon vars', () => {
            const r = new Relation(null, [{ x: 4, g: 3 }]);
            const s = new Relation(null, [{ x: 4, k: 8 }]);

            const g = r.or(s);

            expect(g.size).to.equal(INDEFINITE);
            expect(g.degree).to.equal(3);

            expect(g.has({ x: 4, g: 3, k: 8 })).to.be.true;
            expect(g.has({ x: 4, g: 6, k: 4 })).to.be.true;
            expect(g.has({ x: 6, g: 3, k: 8 })).to.be.false;
            expect(g.has({ x: 6, g: 6, k: 4 })).to.be.false;
        });
    });

    describe('.not', () => { 
        it('should perform the negation', () => {
            const person = new Relation(null, [
                { name: 'Jack' },
                { name: 'Tom' },
                { name: 'Frank' },
                { name: 'Peter' },
                { name: 'Johan' },
                { name: 'Thomas' }
            ]);

            const military = new Relation(null, [
                { name: 'Jack' },
                { name: 'Tom' },
                { name: 'Frank' }
            ]);

            const civilian = military.not().and(person);

            expect(civilian.has({ name: 'Peter' })).to.be.true;
            expect(civilian.has({ name: 'Johan' })).to.be.true;
            expect(civilian.has({ name: 'Thomas' })).to.be.true;
            expect(civilian.has({ name: 'Frank' })).to.be.false;
        });
    });

    describe('.rename', () => {
        it('should perform the rename', () => {
            const r = new Relation(null, [{ g: 4, k: 8 }, { g: 6, k: 2 }]);

            const s = r.rename({ g: 'b' });

            expect(s.has({ b: 4, k: 8 })).to.be.true;
            expect(s.has({ b: 6, k: 2 })).to.be.true;
        });
    });

    describe('.remove', () => {
        it('should perform the remove', () => {
            const r = new Relation(null, [{ d: 3, t: 2 }, { d: 8, t: 3 }]);
            const s = new Relation(null, [{ d: 3, t: 8 }, { d: 8, t: 6 }]);

            const p = r.remove(['t']);

            expect(p.degree).to.equal(1);
            expect(p.heading.d).to.be.ok;
            expect(p.heading.t).to.be.undefined;

            const g = p.and(s);

            expect(g.degree).to.equal(2);
            expect(g.heading.d).to.be.ok;
            expect(g.heading.t).to.be.ok;
        });
    });

    describe('.compose', () => {
        it('should perform the compose', () => {
            const f = new Relation(null, [{ x: 2, y: 8 }]);
            const r = new Relation(null, [{ x: 2 }]);

            const s = f.compose(r);

            expect(s.degree).to.equal(1);
            expect(s.has({ y: 8 })).to.be.true;
        });
    });

    describe('.tclose', () => {
        it('should perform the tclose when definite cardinality', () => {
            const parent = new Relation(null, [
                { a: 'David', b: 'John' },
                { a: 'Jim', b: 'David' },
                { a: 'Steve', b: 'Jim' },
                { a: 'Nathan', b: 'Steve' }
            ]);

            const ancestor = parent.tclose();

            expect(ancestor.has({ a: 'David', b: 'John' })).to.be.true;
            expect(ancestor.has({ a: 'Jim', b: 'David' })).to.be.true;
            expect(ancestor.has({ a: 'Steve', b: 'Jim' })).to.be.true;
            expect(ancestor.has({ a: 'Nathan', b: 'Steve' })).to.be.true;
            expect(ancestor.has({ a: 'Jim', b: 'John' })).to.be.true;
            expect(ancestor.has({ a: 'Steve', b: 'David' })).to.be.true;
            expect(ancestor.has({ a: 'Nathan', b: 'Jim' })).to.be.true;
            expect(ancestor.has({ a: 'Steve', b: 'John' })).to.be.true;
            expect(ancestor.has({ a: 'Nathan', b: 'David' })).to.be.true;
            expect(ancestor.has({ a: 'Nathan', b: 'John' })).to.be.true;
        });

        it('should throw error when indefinite cardinality', () => {
            expect(() => plus.tclose()).to.throw(Error);
        });
    });

    describe('.project', () => {
        it('should perform the project', () => {
            const r = new Relation(null, [{ x: 4, k: 8 }, { x: 6, k: 3 }]);
            const s = r.project(['x']);

            expect(s.degree).to.equal(1);
            expect(s.has({ x: 4 })).to.be.true;
            expect(s.has({ x: 6 })).to.be.true;
        });
    });
});

describe('sqrt', () => {
    it('should compute sqrt', () => {
        const body = [...sqrt.compose(new Relation(null, [{ x: 4 }]))];
        const [y1, y2] = [body[0].y, body[1].y];

        expect(y1).to.equal(2);
        expect(y2).to.equal(-2);
    });
});

describe('plus', () => {
    it('should compute addition', () => {
        const r = plus.compose(new Relation(null, [{ x: 2, y: 4 }]));

        expect([...r][0].z).to.equal(6);
    });
});

describe('subtract', () => {
    it('should compute subtraction', () => {
        const r = subtract.compose(new Relation(null, [{ x: 8, z: 3 }]));

        expect([...r][0].y).to.equal(5);
    });
});

describe('multiply', () => {
    it('should compute multiplication', () => {
        const r = multiply.compose(new Relation(null, [{ y: 3, z: 6 }]));

        expect([...r][0].x).to.equal(2);
    });
});

describe('divide', () => {
    it('should compute division', () => {
        const r = divide.compose(new Relation(null, [{ x: 9, y: 3 }]));

        expect([...r][0].z).to.equal(3);
    });
});

describe('gt', () => {
    it('should compare for greater than', () => {
        const r = gt.and(new Relation(null, [{ x: 4, y: 0 }]));
        
        expect(r.toBoolean()).to.be.true;
    });
});

describe('gte', () => {
    it('should compare for greater than or equal to', () => {
        const r = gte.and(new Relation(null, [{ x: 3, y: 3 }]));
        
        expect(r.toBoolean()).to.be.true;
    });
});

describe('lt', () => {
    it('should compare for less than', () => {
        const r = lt.and(new Relation(null, [{ x: 4, y: 3 }]));
        
        expect(r.toBoolean()).to.be.false;
    });
});

describe('lte', () => {
    it('should compare for less than or equal to', () => {
        const r = lte.and(new Relation(null, [{ x: 6, y: 8 }]));
        
        expect(r.toBoolean()).to.be.true;
    });
});

describe('positive', () => {
    it('should compare for positive', () => {
        const r1 = positive.and(new Relation(null, [{ x: 4 }]));
        expect(r1.toBoolean()).to.be.true;

        const r2 = positive.and(new Relation(null, [{ x: -8 }]));
        expect(r2.toBoolean()).to.be.false;
    });
});

describe('negative', () => {
    it('should compare for negative', () => {
        const r1 = negative.and(new Relation(null, [{ x: -3 }]));
        expect(r1.toBoolean()).to.be.true;

        const r2 = negative.and(new Relation(null, [{ x: 5 }]));
        expect(r2.toBoolean()).to.be.false;
    });
});
