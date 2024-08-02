import test from "node:test";
import assert from "node:assert/strict";
import { assert as typeAssert } from "tsafe/assert";
import { Enum, matchEnum, matches } from "../src/value-enum";

type E1 = "Foo" | { Bar: string } | { Baz: { Deep: boolean } };

typeAssert<"Test" extends Enum ? true : false>();
typeAssert<E1 extends Enum ? true : false>();

test("matchEnum", () => {
  const extract = (v: E1) => {
    return matchEnum(v, (name, value) => {
      return [name, value];
    });
  };
  assert.deepStrictEqual(extract("Foo"), ["Foo", undefined]);
  assert.deepStrictEqual(extract({ Bar: "a value" }), ["Bar", "a value"]);
  assert.deepStrictEqual(extract("Foo"), ["Foo", undefined]);
  const [_, v] = extract({ Baz: { Deep: false } });
  // @ts-expect-error no need to get fancy with types here, just asserting
  // that the inner value is also matchable
  assert.deepStrictEqual(extract(v), ["Deep", false]);
});

test("matches", () => {
  const foo: E1 = "Foo";
  const bar: E1 = { Bar: "hello" };
  const baz: E1 = { Baz: { Deep: true } };
  assert.ok(matches(foo, "Foo"));
  assert.ok(matches(bar, "Bar"));
  assert.ok(matches(baz, "Baz"));
  assert.ok(!matches(foo as E1, "Bar"));
});
