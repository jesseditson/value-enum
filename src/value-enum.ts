export type ValueEnum<K extends string = string, V = any> = {
  [P in K]: Record<P, V> & Partial<Record<Exclude<K, P>, never>> extends infer O
    ? { [Q in keyof O]: O[Q] }
    : never;
}[K];

export type Enum<T = any, K extends string = string> = K | ValueEnum<K, T>;
type ArmArgs<T extends Enum> = T extends ValueEnum
  ? { [K in keyof T]: [key: K, val: T[K]] }[keyof T]
  : [key: T & string, val: undefined];
type EnumMatch<T extends Enum<K>, K extends string = string> = T extends object
  ? keyof T
  : T;

export const matchEnum = <T extends Enum, RT>(
  enm: T,
  arm: (...args: ArmArgs<T>) => RT
): RT => {
  let args: ArmArgs<T>;
  if (typeof enm == "string") {
    args = [enm, undefined] as ArmArgs<T>;
  } else {
    const k = Object.keys(enm)[0] as keyof typeof enm;
    args = [k, enm[k]] as ArmArgs<T>;
  }
  return arm(...args);
};

export const matches = <T extends Enum>(enm: T, m: EnumMatch<T>): boolean => {
  if (typeof enm == "string") {
    return enm == m;
  } else {
    const k = Object.keys(enm)[0];
    return k === m;
  }
};
