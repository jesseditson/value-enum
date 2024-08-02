# value-enum

an npm package with utilities for handling object-based, optionally value-containing, enums.

## Motivation

While building interoperability between typescript and Rust codebases (like the [archival editor](https://github.com/jesseditson/archival-editor)), I use the [typescript_type_def](https://docs.rs/typescript-type-def/latest/typescript_type_def/) crate to generate types from Rust types.

In Rust, enums may have values, which makes for clean handling of non-uniform types. For instance:

```rust
#[derive(Default, Debug, serde::Serialize, serde::Deserialize)]
#[cfg_attr(feature = "typescript", derive(typescript_type_def::TypeDef))]
#[Derive]
enum Foo {
    #[default]
    Empty,
    MyType(String),
    Number(usize)
}
```

This type can then be used in Rust via `match`:

```rust
let val = Foo::MyType("something".to_string());
let extracted = match val {
    Foo::Empty => None,
    Foo::MyType(s) => Some(s),
    Foo::Number(n) => None
}
```

When you generate types for an enum, they result in a union type of strings and single-keyed objects. For instance, the above type becomes:

```typescript
type Usize = number;
type Foo = "Empty" | { MyType: string } | { Number: Usize };
```

This pattern is quite useful, but can be a bit unweildy when using directly in typescript.
This library provides simple types & utilities for making these types of enums easy to work with in typescript.

## Types

This package exports the following types:

### `Enum`

The `Enum` type just describes the above pattern as a type - e.g. it will fail if you attempt to extend it with a multi-keyed object. Mostly useful as a type check, as you will likely want to use enum types directly.

## API

This package exports the following functions:

### `matchEnum<T>(enm: Enum, (typ: String, val: any) => T) => T`

This is the primary API by which enums can be matched. Like the Rust API, it allows you to write typed branches for each of the Enum's values, using a `switch` statement. Using the type `Foo` above:

```typescript
const handleFoo = (foo: Foo) => {
  const extracted = matchEnum(foo, (typ, val) => {
    switch (typ) {
      case "Empty":
        return null;
      case "MyType":
        return val;
      case "Number":
        return null;
    }
  });
};
```

### `matches(enm: Enum, typ: string) => boolean`

Like Rust's `matches!` macro, this is a quick way to do a type-safe check on an Enum's type:

```typescript
const t = "Empty" as Foo;
matches(t, "Empty");
// Note that attempting to use an invalid key will cause a type error:
matches(t, "InvalidKey"); // Argument of type '"InvalidKey"' is not assignable to parameter of type '"Foo" | "MyType" | "Number"'

// This will return false, but will pass type checks, as "Number" is a valid enum key.
matches(t, "Number");
```
