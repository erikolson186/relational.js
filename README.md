![relational.js](https://cldup.com/_0Mg316Cxd.png)

**relational.js** is a logic programming package based on the relational model that implements the definitional algebra **A** as defined in [Appendix A](http://www.dcs.warwick.ac.uk/~hugh/TTM/APPXA.pdf) of *Databases, Types and the Relational Model: The Third Manifesto (TTM)*.

**relational.js** conforms to a subset of the *RM Prescriptions* and *RM Proscriptions* defined in *TTM* for a relational language **D**. An approach to a relational query interface is offered distinct from the proposals of Darwen and Date in *TTM* in that support for resolution theorem proving based on Horn clauses is provided for computing relations with definite cardinalities as results of queries of relations with indefinite cardinalities.

This implementation supports the full range of relational operators of **A** for computing the conjunction, disjunction, negation, renaming of attributes, removing of attributes, composition and transitive closures of relations. Thus relations with an indefinite cardinality are definable and queryable. In addition, a database of operators defined as relations is provided which includes relations for square roots, addition, subtraction, multiplication, etc.

This package is written in ECMAScript 6 and presents an interface for defining and using relations that provides a superset of the properties and methods of an instance of the built-in [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) constructor.

## Installation

To install **relational.js** for usage with [node](https://nodejs.org/):

```
$ npm install relational.js
```

## Usage

```javascript
let Relational = require('relational.js');
let { Relation } = Relational;
```

### Defining Relations

Relations are defined using the `Relation(heading, body[, rule_fn])` constructor where **heading** is an object with enumerable properties being attribute names with the values being type constructors, and **body** is an iterable of tuples as objects that conform to the heading. If **heading** is missing, but **body** isn't, then the heading is inferred using **body**, otherwise the relation will have a degree of zero. 

The **rule_fn** argument is optional and acts as a rule defined for the relation. Rules are used for defining theorems as a series of goals that when queried an attempt is made to resolve tuples by proving the theorem true by finding values of attributes that satisfy the rules. If a value for **rule_fn** is supplied it must be a function that accepts a single argument being an object with bound variable identifiers as enumerable properties that includes the corresponding values. The function acts as a Horn clause similar to the rules of Datalog and Prolog. If the solution to the rule for any given supplied bound variables is an indefinite number of tuples then **rule_fn** should return `Symbol(indefinite)`. If there is no solution it should return `undefined`, `null` or `false`. Otherwise it should return the solution as an iterable of tuples as objects. It is optional for the returned tuples as objects to include enumerable properties of the bound variables. If the tuples of the solution only contain the bound variables, then **rule_fn** can optionally return `true`. When a rule is provided, the `Relation` object has a `size` attribute of value `Symbol(indefinite)`.

```javascript
let r = new Relation();
let s = new Relation({ x: Number });
let p = new Relation({ d: Number }, [{ d: 4 }]);
let g = new Relation(null, [{ k: 8 }]);
```

An example of using rules to define a relation with a heading that includes the single attribute **x** of type `Number`, and a body of an infinite number of tuples (which are not computed) where the value of **x** is a positive number.

```javascript
let positive = new Relation({ x: Number }, null, ({ x }) => x >= 0);

console.log(`It is ${positive.has({ x: -3 })} that -3 is positive.`);
console.log(`It is ${positive.has({ x: 4 })} that 4 is positive.`);
```

Which outputs:

```
It is false that -3 is positive.
It is true that 4 is positive.
```

An object instantiated using the `Relation` constructor has the following accessor properties: `heading` which returns the heading object, `degree` which returns the number of attributes of the heading, and `size` which returns the cardinality of the body as a number or `Symbol(indefinite)`.

### Inserting into Relations

Where **r** is an instance of `Relation`, and **tuple** is an object with enumerable properties and value types that include those in the heading of **r**, the method invocation `r.add(tuple)` inserts **tuple** into the body of **r** if it is not already in it and returns **r**.

```javascript
let r = new Relation({ x: Number, k: Number });

r.add({ x: 4, k: 8 });
```

### Deleting from Relations

Where **r** is an instance of `Relation` representing a relation with a definite cardinality, and **tuple** is any object, the method invocation `R.delete(tuple)` removes **tuple** from the body of **r** if it is in it and returns `true`, otherwise it returns `false`.

```javascript
let r = new Relation(null, [{ d: 3.0 }, { d: 4.8 }]);

r.delete({ d: 4.8 });
```

### Iterating over Relations

Instances of `Relation` are iterable and can be iterated over when the relation has a definite cardinality.

```javascript
let s = new Relation(null, [{ k: 4 }, { k: 8 }, { k: 6 }]);

for (let { k } of s) {
    console.log(`s: The value of k is ${k}.`);
}
```

Which outputs:

```
s: The value of k is 4.
s: The value of k is 8.
s: The value of k is 6.
```

Also defined for iteration are the methods `entries`, `forEach`, `keys`, and `values`, with the same usage as with an instance of the built-in [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) constructor.

### Boolean Value of a Relation

The predicate of a relation is true if the cardinality of the relation is greater than zero. Where **r** is an instance of `Relation`, the result of `r.toBoolean()` is the corresponding boolean value of **r**.

```javascript
// predicate: Person with a name and an age.
let heading = { name: String, age: Number };

// fact: Person named Jack whose age is 30.
let tuple = { name: 'Jack', age: 30 };

let person = new Relation(heading, [tuple]);

console.log(`The predicate of person is ${person.toBoolean()}.`);
```

Which outputs:

```
The predicate of person is true.
```

### Relational Operators

#### Conjunction (and)

Where **r1** and **r2** are both instances of `Relation` with the types of any common attributes of the headings being equal, and **s** is the result of `r1.and(r2)`. The value of **s** is an instance of `Relation` with the heading being the union of the headings of **r1** and **r2**. If the cardinalities of both **r1** and **r2** are indefinite, or the cardinality of **r1** or **r2** is indefinite and no tuples of the indefinite body could be resolved using the definite body, then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is a superset of both some tuple in the body of the relation represented by **r1** and some tuple in the body of the relation represented by **r2**.

If the predicates of **r1** and **r2** contain common free variables, then the body of the relation represented by **s** is the *natural join* of the bodies of the relations represented by **r1** and **r2**, otherwise it is the *Cartesian product* of the two relations.

```javascript
// predicate: Person with a name and an age.
let person = new Relation(null, [
    { name: 'Thomas', age: 30 },
    { name: 'Jack', age: 44 }
]);

// predicate: Employee with a name and a job position.
let employee = new Relation(null, [
    { name: 'Thomas', position: 'programmer' },
    { name: 'Jack', position: 'manager' }
]);

// predicate: Someone who is a person and an employee.
let someone = person.and(employee);

for (let { name, age, position } of someone) {
    console.log(`Person and employee ${name} age ${age} is a ${position}.`);
}
```

Which outputs:

```
Person and employee Thomas age 30 is a programmer.
Person and employee Jack age 44 is a manager.
```

An instance of the `Set` constructor includes the `has` method. An instance of `Relation` includes this method as a macro method that combines `and` with `toBoolean`. Where **r** is an instance of `Relation`, **tuple** is any object, and **b** is the result of `r.has(tuple)`. The value of **b** is a boolean being `true` if **tuple** is in the body of the relation represented by **r**, or `false` if it is not.

```javascript
let person = new Relation(null, [{ name: 'Jack' }, { name: 'Tom' }]);

let b = person.has({ name: 'Tom' });

console.log(`It is ${b} that there is a person named Tom.`);
```

Which outputs:

```
It is true that there is a person named Tom.
```

#### Disjunction (or)

Where **r1** and **r2** are both instances of `Relation` with the types of any common attributes of the headings being equal, and **s** is the result of `r1.or(r2)`. The value of **s** is an instance of `Relation` with the heading being the union of the headings of **r1** and **r2**. If the cardinality of either **r1** or **r2** is indefinite then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is a superset of both some tuple in the body of the relation represented by **r1** or some tuple in the body of the relation represented by **r2**.

If the predicates of **r1** and **r2** contain common free variables, then the body of the relation represented by **s** is the *union* of the bodies of the relations represented by **r1** and **r2**. Otherwise the body is an infinite number of tuples where the values of attributes not common to **r1** and **r2** are any possible value whether or not it is in the bodies of the relations represented by **r1** or **r2**.

```javascript
// predicate: Truck with a make, model and year.
let truck = new Relation(null, [{ make: 'Ford', model: 'F-150', year: 2016 }]);

// predicate: Car with a make, model and year.
let car = new Relation(null, [{ make: 'Ford', model: 'Mustang', year: 2015 }]);

// predicate: Vehicle that is either a truck or a car.
let vehicle = truck.or(car);

for (let { make, model, year } of vehicle) {
    console.log(`Make ${make} model ${model} year ${year} is a vehicle.`);
}
```

Which outputs:

```
Make Ford model F-150 year 2016 is a vehicle.
Make Ford model Mustang year 2015 is a vehicle.
```

#### Negation (not)

Where **r** is an instance of `Relation`, and **s** is the result of `r.not()`. The value of **s** is an instance of `Relation` with the same heading as that of **r**. The size of **s** is `Symbol(indefinite)` and the body of the relation represented by **s** is a possibly infinite number of tuples conforming to the heading of **s** that are not in the body of the relation represented by **r**.

```javascript
// predicate: Person with a name.
let person = new Relation(null, [
    { name: 'Jack' },
    { name: 'Tom' },
    { name: 'Frank' },
    { name: 'Peter' },
    { name: 'Johan' },
    { name: 'Thomas' }
]);

// predicate: Military personnel with a name.
let military = new Relation(null, [
    { name: 'Jack' },
    { name: 'Tom' },
    { name: 'Frank' }
]);

// predicate: Civilian who is a person.
let civilian = military.not().and(person);

for (let { name } of civilian) {
    console.log(`There exists a civilian named ${name}.`);
}
```

Which outputs:

```
There exists a civilian named Peter.
There exists a civilian named Johan.
There exists a civilian named Thomas.
```

#### Renaming Attributes (rename)

Where **r** is an instance of `Relation`, and **obj** is an object with enumerable properties being attribute names in the heading of **r** to be renamed, with the values being attribute names not in the heading of **r** to be renamed to, and **s** is the result of `r.rename(obj)`. The value of **s** is an instance of `Relation` with the heading being the heading of **r** with the attribute names renamed in accordance to **obj**. If the cardinality of **r** is indefinite then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple in the body of the relation represented by **r** except that the attribute names are renamed in accordance to **obj**.

```javascript
// predicate: "r" with "g" and "k" values.
let r = new Relation(null, [{ g: 4, k: 8 }, { g: 6, k: 2 }]);

let s = r.rename({ g: 'b' });

for (let { b, k } of s) {
    console.log(`s: The value of b is ${b} and k is ${k}.`);
}
```

Which outputs:

```
s: The value of b is 4 and k is 8.
s: The value of b is 6 and k is 2.
```

#### Removing Attributes (remove)

Where **r** is an instance of `Relation`, **attrs** is an iterable of attribute names, and **s** is the result of `r.remove(attrs)`. The value of **s** is an instance of `Relation` with the heading being the heading of **r** minus the attributes in **attrs**. If the cardinality of **r** is indefinite then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is a subset of some tuple in the body of the relation represented by **r**.

```javascript
// predicate: "r" with "d" and "t" values.
let r = new Relation(null, [{ d: 3, t: 2 }, { d: 8, t: 3 }]);

// predicate: "s" with "d" and "t" values.
let s = new Relation(null, [{ d: 3, t: 8 }, { d: 8, t: 6 }]);

let p = r.remove(['t']);

console.log(`p: The degree is ${p.degree}.`);

for (let { d, t } of p) {
    console.log(`p: The value of d is ${d} and t is ${t}.`);
}

let g = p.and(s);

console.log(`g: The degree is ${g.degree}.`);

for (let { d, t } of g) {
    console.log(`g: The value of d is ${d} and t is ${t}.`);
}
```

Which outputs:

```
p: The degree is 1.
p: The value of d is 3 and t is undefined.
p: The value of d is 8 and t is undefined.
g: The degree is 2.
g: The value of d is 3 and t is 8.
g: The value of d is 8 and t is 6.
```

#### Composition (compose)

Where **r1** and **r2** are both instances of `Relation`, and **s** is the result of `r1.compose(r2)`. The value of **s** is an instance of `Relation` with the heading being the union of the headings of **r1** and **r2** minus attribute names common to the headings of both **r1** and **r2**. If the cardinality of **r** is indefinite then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is a subset of some tuple in the body of the relation represented by `r2.and(r2)`. The compose operator corresponds to functional composition.

```javascript
// predicate: "f" with "x" and "y" values.
let f = new Relation(null, [{ x: 2, y: 8 }]);

// predicate: "r" with an "x" value.
let r = new Relation(null, [{ x: 2 }]);

// predicate: "s" with a "y" value in "f".
let s = f.compose(r);

console.log(`s: The value of y is ${[...s][0].y}.`);
```

Which outputs:

```
s: The value of y is 8.
```

#### Transitive Closure (tclose)

Where **r** is an instance of `Relation` with a definite size, and **s** is the result of `r.tclose()`. The value of **s** is an instance of `Relation` with the same heading as that of **r**. The body of **s** is the transitive closure of the body of **r**.

```javascript
// predicate: parent "a" has child "b".
let parent = new Relation(null, [
    { a: 'David', b: 'John' },
    { a: 'Jim', b: 'David' },
    { a: 'Steve', b: 'Jim' },
    { a: 'Nathan', b: 'Steve' }
]);

// predicate: ancestor "a" has descendant "b".
let ancestor = parent.tclose();

for (let { a, b } of ancestor) {
    console.log(`${a} is an ancestor of ${b}.`);
}
```

Which outputs:

```
David is an ancestor of John.
Jim is an ancestor of David.
Steve is an ancestor of Jim.
Nathan is an ancestor of Steve.
Jim is an ancestor of John.
Steve is an ancestor of David.
Nathan is an ancestor of Jim.
Steve is an ancestor of John.
Nathan is an ancestor of David.
Nathan is an ancestor of John.
```

#### Projection (project)

Where **r** is an instance of `Relation`, **attrs** is an iterable of attribute names, and **s** is the result of `r.tclose()`. The value of **s** is an instance of `Relation` with the same heading as that of **r** minus any attributes not found in **attrs**. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is either a subset of or equal to some tuple in the body of the relation represented by **r**.

```javascript
let r = new Relation(null, [{ x: 4, k: 8 }, { x: 6, k: 3 }]);
let s = r.project(['x']);

console.log(`s: The degree is ${s.degree}.`);

for (let { x, k } of s) {
    console.log(`s: The value of x is ${x} and k is ${k}.`);
}
```

Which outputs:

```
s: The degree is 1.
s: The value of x is 4 and k is undefined.
s: The value of x is 6 and k is undefined.
```

### Operators Defined as Relations

As noted and discussed in Appendix A of *TTM*, operators can be treated as relations and invoked using relational conjunction with another relation that supplies arguments. The following are some operators defined as relations that relational.js provides. If an operator is not provided with sufficient arguments to resolve the free variables then the resulting `Relation` object has a size of `Symbol(indefinite)`. The body of the relation is only resolved if the relational disjunction is applied to it and another `Relation` object with a body that includes the necessary arguments. In essence this is a relational form of the partial application of functions.

#### Square Root (sqrt)

```javascript
let { sqrt } = Relational;

let body = [...sqrt.compose(new Relation(null, [{ x: 4 }]))];
let [y1, y2] = [body[0].y, body[1].y];

console.log(`The value of y in sqrt(4) = y is ${y1} or ${y2}.`);
```

Which outputs:

```
The value of y in sqrt(4) = y is 2 or -2.
```

#### Addition (plus)

```javascript
let { plus } = Relational;

let r = plus.compose(new Relation(null, [{ x: 2, y: 4 }]));

console.log(`The result of z in 2 + 4 = z is ${[...r][0].z}.`);
```

Which outputs:

```
The result of z in 2 + 4 = z is 6.
```

#### Subtraction (subtract)

```javascript
let { subtract } = Relational;

let r = subtract.compose(new Relation(null, [{ x: 8, z: 3 }]));

console.log(`The result of y in 8 - y = 3 is ${[...r][0].y}.`);
```

Which outputs:

```
The result of y in 8 - y = 3 is 5.
```

#### Multiplication (multiply)

```javascript
let { multiply } = Relational;

let r = multiply.compose(new Relation(null, [{ y: 3, z: 6 }]));

console.log(`The result of x in x * 3 = 6 is ${[...r][0].x}.`);
```

Which outputs:

```
The result of x in x * 3 = 6 is 2.
```

#### Division (divide)

```javascript
let { divide } = Relational;

let r = divide.compose(new Relation(null, [{ x: 9, y: 3 }]));

console.log(`The result of z in 9 / 3 = z is ${[...r][0].z}.`);
```

Which outputs:

```
The result of z in 9 / 3 = z is 3.
```

#### Ranges (gt, gte, lt, and lte)

```javascript
let { gt, gte, lt, lte } = Relational;

let r1 = gt.and(new Relation(null, [{ x: 4, y: 0 }]));
console.log(`It is ${r1.toBoolean()} that 4 > 0.`);

let r2 = gte.and(new Relation(null, [{ x: 3, y: 3 }]));
console.log(`It is ${r2.toBoolean()} that 3 >= 3.`);

let r3 = lt.and(new Relation(null, [{ x: 4, y: 3 }]));
console.log(`It is ${r3.toBoolean()} that 4 < 3.`);

let r4 = lte.and(new Relation(null, [{ x: 6, y: 8 }]));
console.log(`It is ${r4.toBoolean()} that 6 <= 8.`);
```

Which outputs:

```
It is true that 4 > 0.
It is true that 3 >= 3.
It is false that 4 < 3.
It is true that 6 <= 8.
```

#### Sign (positive and negative)

```javascript
let { positive, negative } = Relational;

let r1 = positive.and(new Relation(null, [{ x: 4 }]));
console.log(`It is ${r1.toBoolean()} that 4 is positive.`);

let r2 = positive.and(new Relation(null, [{ x: -8 }]));
console.log(`It is ${r2.toBoolean()} that -8 is positive.`);

let r3 = negative.and(new Relation(null, [{ x: -3 }]));
console.log(`It is ${r3.toBoolean()} that -3 is negative.`);

let r4 = negative.and(new Relation(null, [{ x: 5 }]));
console.log(`It is ${r4.toBoolean()} that 5 is negative.`);
```

Which outputs:

```
It is true that 4 is positive.
It is false that -8 is positive.
It is true that -3 is negative.
It is false that 5 is negative.
```

## License

MIT, please view the LICENSE file.