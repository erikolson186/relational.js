![relational.js](https://cldup.com/_0Mg316Cxd.png)

**relational.js** is an implementation of the relational algebra named **A**, as defined in [Appendix A](http://www.dcs.warwick.ac.uk/~hugh/TTM/APPXA.pdf) of *Databases, Types and the Relational Model: The Third Manifesto (TTM)*, for [node](https://nodejs.org/en/).

This implementation supports the full range of relational operators of **A** for computing the conjunction, disjunction, negation, renaming of attributes, removing of attributes, composition and transitive closures of relations. Thus relations with an indefinite cardinality (an unknown or possibly infinite number of tuples) are definable and queryable. In addition, a database of operators defined as relations is provided which includes relations for square roots, addition, subtraction, multiplication, etc.

The functionality of relational.js is derived from the logic programming paradigm along side Datalog and Prolog, and does not reflect the intent of the generic language **D** or definitional language **A** as defined in *TTM*. However this implementation does conform to several of the *RM Prescriptions* and *RM Proscriptions* defined in *TTM*.

This module is written in ECMAScript 6 and presents an interface for defining and using relations that provides a superset of the properties and methods of an instance of the built-in [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) constructor.

## Installation

```
$ npm install relational.js
```

## Usage

```javascript
let Relational = require('relational.js');
let { Relation } = Relational;
```

### Defining Relations

Relations are defined using the `Relation(heading[, body])` constructor where **heading** is an iterable of attribute names and **body** is an iterable of objects with enumerable properties that include those in the heading. Due to JavaScript not being strongly typed, the heading of a relation defined using relational.js does not include types as required by *TTM*.

```javascript
let r = new Relation(['x']);
let p = new Relation(['d'], [{ d: 4 }]);
let s = new Relation(null, [{ k: 8 }]);
let g = new Relation();
```

An object instantiated using the `Relation` constructor has the following accessor properties: `heading` which returns the heading object, `degree` which returns the number of attributes of the heading, and `size` which returns the cardinality of the body as a number or `Symbol(indefinite)`.

### Inserting into Relations

Where **r** is an instance of `Relation`, and **tuple** is an object with enumerable properties that include those in the heading of **r**, the method invocation `r.add(tuple)` inserts **tuple** into the body of **r** if it is not already in it and returns **r**.

```javascript
let r = new Relation(['x', 'k']);

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
    console.log(`The value of k is ${k}.`);
}
```

Which outputs:

```
The value of k is 4.
The value of k is 8.
The value of k is 6.
```

Also defined for iteration are the methods `entries`, `forEach`, `keys`, and `values`, with the same usage as with an instance of the built-in [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) constructor.

### Boolean Value of a Relation

The predicate of a relation is true if the cardinality of the relation is greater than zero. Where **r** is an instance of `Relation`, the result of `r.toBoolean()` is the corresponding boolean value of **r**.

```javascript
// predicate: Person with a name and an age.
let heading = ['name', 'age'];

// fact: Person named Jack whose age is 30.
let tuple = { name: 'Jack', age: 30 };

let person = new Relation(null, [tuple]);

console.log(`The predicate of person is ${person.toBoolean()}.`);
```

Which outputs:

```
The predicate of person is true.
```

### Defining Rules

An instance of `Relation` supports the definition of rules. This functionality is similar to the rules of Datalog and Prolog. Where **r** is an instance of `Relation`, and **fn** is a function, the method invocation `r.rule(fn)` defines **fn** as a rule for **r**. The function **fn** must accept a single argument being an object with bound variables as enumerable properties. If the solution to the rule for any given supplied bound variables is an indefinite number of tuples then **fn** should return `Symbol(indefinite)`. If there is no solution it should return `undefined`, `null` or `false`. Otherwise it should return the solution as an iterable of tuples as objects. It is optional for the returned tuples as objects to include enumerable properties of the bound variables. If the tuples of the solution only contain the bound variables, then **fn** can optionally return `true`. 

```javascript
let positive = new Relation(['x']);
positive.rule(({ x }) => x > 0);

console.log(`It is ${positive.has({ x: -3 })} that -3 is positive.`);
console.log(`It is ${positive.has({ x: 4 })} that 4 is positive.`);
```

Which outputs:

```
It is false that -3 is positive.
It is true that 4 is positive.
```

### Relational Operators

#### Conjunction (and)

Where **r1** and **r2** are both instances of `Relation`, and **s** is the result of `r1.and(r2)`. The value of **s** is an instance of `Relation` with the heading being the union of the headings of **r1** and **r2**. If the cardinalities of both **r1** and **r2** are indefinite, or the cardinality of **r1** or **r2** is indefinite and no tuples of the indefinite body could be resolved using the definite body, then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is a superset of both some tuple in the body of the relation represented by **r1** and some tuple in the body of the relation represented by **r2**.

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

Where **r1** and **r2** are both instances of `Relation`, and **s** is the result of `r1.or(r2)`. The value of **s** is an instance of `Relation` with the heading being the union of the headings of **r1** and **r2**. If the cardinality of either **r1** or **r2** is indefinite then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is a superset of both some tuple in the body of the relation represented by **r1** or some tuple in the body of the relation represented by **r2**.

If the predicates of **r1** and **r2** contain common free variables, then the body of the relation represented by **s** is the *union* of the bodies of the relations represented by **r1** and **r2**. Otherwise the body is an infinite number of tuples where the values of attributes not common to **r1** and **r2** are any possible value whether or not it is in the bodies of the relations represented by **r1** or **r2**.

```javascript
// predicate: Truck with a model name and a year.
let truck = new Relation(null, [{ model: 'Ford F-150', year: 2016 }]);

// predicate: Car with a model name and a year.
let car = new Relation(null, [{ model: 'Ford Mustang', year: 2015 }]);

// predicate: Vehicle that is either a truck or a car.
let vehicle = truck.or(car);

for (let { model, year } of vehicle) {
    console.log(`model ${model} year ${year} is a vehicle.`);
}
```

Which outputs:

```
Model Ford F-150 year 2016 is a vehicle.
Model Ford Mustang year 2015 is a vehicle.
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

Where **r** is an instance of `Relation`, **a** and **b** are both attribute names where **a** is in the heading of **r** and **b** is not, and **s** is the result of `r.rename(a, b)`. The value of **s** is an instance of `Relation` with the heading being the heading of **r** with the attribute name **a** renamed to **b**. If the cardinality of **r** is indefinite then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple in the body of the relation represented by **r** except that the attribute name **a** is replaced with **b**.

```javascript
// predicate: "r" with "g" and "k" values.
let r = new Relation(null, [{ g: 4, k: 8 }, { g: 6, k: 2 }]);

let s = r.rename('g', 'b');

for (let { b, k } of s) {
    console.log(`The value of b is ${b} and k is ${k}.`);
}
```

Which outputs:

```
The value of b is 4 and k is 8.
The value of b is 6 and k is 2.
```

#### Removing Attributes (remove)

Where **r** is an instance of `Relation`, **a** is an attribute name in the heading of **r**, and **s** is the result of `r.remove(a)`. The value of **s** is an instance of `Relation` with the heading being the heading of **r** minus the attribute **a**. If the cardinality of **r** is indefinite then the size attribute of **s** is `Symbol(indefinite)`. The body of the relation represented by **s** is a possibly infinite number of every tuple that conforms to the heading of **s** and is a subset of some tuple in the body of the relation represented by **r**.

```javascript
// predicate: "r" with "d" and "t" values.
let r = new Relation(null, [{ d: 3, t: 2 }, { d: 8, t: 3 }]);

// predicate: "s" with "d" and "t" values.
let s = new Relation(null, [{ d: 3, t: 8 }, { d: 8, t: 6 }]);

let p = r.remove('t').and(s);

for (let { d, t } of p) {
    console.log(`The value of d is ${d} and t is ${t}.`);
}
```

Which outputs:

```
The value of d is 3 and t is 8.
The value of d is 8 and t is 6.
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

console.log(`The value of y is ${[...s][0].y}.`);
```

Which outputs:

```
The value of y is 8.
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

### Operators Defined as Relations

As noted and discussed in Appendix A of TTM, operators can be treated as relations and invoked using relational conjunction with another relation that supplies arguments. The following are some operators defined as relations that relational.js provides. If an operator is not provided with sufficient arguments to resolve the free variables then the resulting `Relation` object has a size of `Symbol(indefinite)`. The body of the relation is only resolved if the relational disjunction is applied to it and another `Relation` object with a body that includes the necessary arguments. In essence this is a relational form of the partial application of functions.

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