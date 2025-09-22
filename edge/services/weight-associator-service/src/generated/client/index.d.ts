
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model WeightReading
 * 
 */
export type WeightReading = $Result.DefaultSelection<Prisma.$WeightReadingPayload>
/**
 * Model LabReading
 * 
 */
export type LabReading = $Result.DefaultSelection<Prisma.$LabReadingPayload>
/**
 * Model WeightAssociation
 * 
 */
export type WeightAssociation = $Result.DefaultSelection<Prisma.$WeightAssociationPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more WeightReadings
 * const weightReadings = await prisma.weightReading.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more WeightReadings
   * const weightReadings = await prisma.weightReading.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.weightReading`: Exposes CRUD operations for the **WeightReading** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WeightReadings
    * const weightReadings = await prisma.weightReading.findMany()
    * ```
    */
  get weightReading(): Prisma.WeightReadingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.labReading`: Exposes CRUD operations for the **LabReading** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LabReadings
    * const labReadings = await prisma.labReading.findMany()
    * ```
    */
  get labReading(): Prisma.LabReadingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.weightAssociation`: Exposes CRUD operations for the **WeightAssociation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WeightAssociations
    * const weightAssociations = await prisma.weightAssociation.findMany()
    * ```
    */
  get weightAssociation(): Prisma.WeightAssociationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    WeightReading: 'WeightReading',
    LabReading: 'LabReading',
    WeightAssociation: 'WeightAssociation'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "weightReading" | "labReading" | "weightAssociation"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      WeightReading: {
        payload: Prisma.$WeightReadingPayload<ExtArgs>
        fields: Prisma.WeightReadingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeightReadingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeightReadingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>
          }
          findFirst: {
            args: Prisma.WeightReadingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeightReadingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>
          }
          findMany: {
            args: Prisma.WeightReadingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>[]
          }
          create: {
            args: Prisma.WeightReadingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>
          }
          createMany: {
            args: Prisma.WeightReadingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WeightReadingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>[]
          }
          delete: {
            args: Prisma.WeightReadingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>
          }
          update: {
            args: Prisma.WeightReadingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>
          }
          deleteMany: {
            args: Prisma.WeightReadingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeightReadingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WeightReadingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>[]
          }
          upsert: {
            args: Prisma.WeightReadingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightReadingPayload>
          }
          aggregate: {
            args: Prisma.WeightReadingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeightReading>
          }
          groupBy: {
            args: Prisma.WeightReadingGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeightReadingGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeightReadingCountArgs<ExtArgs>
            result: $Utils.Optional<WeightReadingCountAggregateOutputType> | number
          }
        }
      }
      LabReading: {
        payload: Prisma.$LabReadingPayload<ExtArgs>
        fields: Prisma.LabReadingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LabReadingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LabReadingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>
          }
          findFirst: {
            args: Prisma.LabReadingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LabReadingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>
          }
          findMany: {
            args: Prisma.LabReadingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>[]
          }
          create: {
            args: Prisma.LabReadingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>
          }
          createMany: {
            args: Prisma.LabReadingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LabReadingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>[]
          }
          delete: {
            args: Prisma.LabReadingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>
          }
          update: {
            args: Prisma.LabReadingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>
          }
          deleteMany: {
            args: Prisma.LabReadingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LabReadingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LabReadingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>[]
          }
          upsert: {
            args: Prisma.LabReadingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LabReadingPayload>
          }
          aggregate: {
            args: Prisma.LabReadingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLabReading>
          }
          groupBy: {
            args: Prisma.LabReadingGroupByArgs<ExtArgs>
            result: $Utils.Optional<LabReadingGroupByOutputType>[]
          }
          count: {
            args: Prisma.LabReadingCountArgs<ExtArgs>
            result: $Utils.Optional<LabReadingCountAggregateOutputType> | number
          }
        }
      }
      WeightAssociation: {
        payload: Prisma.$WeightAssociationPayload<ExtArgs>
        fields: Prisma.WeightAssociationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeightAssociationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeightAssociationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>
          }
          findFirst: {
            args: Prisma.WeightAssociationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeightAssociationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>
          }
          findMany: {
            args: Prisma.WeightAssociationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>[]
          }
          create: {
            args: Prisma.WeightAssociationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>
          }
          createMany: {
            args: Prisma.WeightAssociationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WeightAssociationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>[]
          }
          delete: {
            args: Prisma.WeightAssociationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>
          }
          update: {
            args: Prisma.WeightAssociationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>
          }
          deleteMany: {
            args: Prisma.WeightAssociationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeightAssociationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WeightAssociationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>[]
          }
          upsert: {
            args: Prisma.WeightAssociationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightAssociationPayload>
          }
          aggregate: {
            args: Prisma.WeightAssociationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeightAssociation>
          }
          groupBy: {
            args: Prisma.WeightAssociationGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeightAssociationGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeightAssociationCountArgs<ExtArgs>
            result: $Utils.Optional<WeightAssociationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    weightReading?: WeightReadingOmit
    labReading?: LabReadingOmit
    weightAssociation?: WeightAssociationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model WeightReading
   */

  export type AggregateWeightReading = {
    _count: WeightReadingCountAggregateOutputType | null
    _avg: WeightReadingAvgAggregateOutputType | null
    _sum: WeightReadingSumAggregateOutputType | null
    _min: WeightReadingMinAggregateOutputType | null
    _max: WeightReadingMaxAggregateOutputType | null
  }

  export type WeightReadingAvgAggregateOutputType = {
    value: number | null
  }

  export type WeightReadingSumAggregateOutputType = {
    value: number | null
  }

  export type WeightReadingMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    farmId: string | null
    houseId: string | null
    stationId: string | null
    sensorId: string | null
    value: number | null
    unit: string | null
    quality: string | null
    timestamp: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeightReadingMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    farmId: string | null
    houseId: string | null
    stationId: string | null
    sensorId: string | null
    value: number | null
    unit: string | null
    quality: string | null
    timestamp: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeightReadingCountAggregateOutputType = {
    id: number
    tenantId: number
    farmId: number
    houseId: number
    stationId: number
    sensorId: number
    value: number
    unit: number
    quality: number
    metadata: number
    timestamp: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WeightReadingAvgAggregateInputType = {
    value?: true
  }

  export type WeightReadingSumAggregateInputType = {
    value?: true
  }

  export type WeightReadingMinAggregateInputType = {
    id?: true
    tenantId?: true
    farmId?: true
    houseId?: true
    stationId?: true
    sensorId?: true
    value?: true
    unit?: true
    quality?: true
    timestamp?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeightReadingMaxAggregateInputType = {
    id?: true
    tenantId?: true
    farmId?: true
    houseId?: true
    stationId?: true
    sensorId?: true
    value?: true
    unit?: true
    quality?: true
    timestamp?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeightReadingCountAggregateInputType = {
    id?: true
    tenantId?: true
    farmId?: true
    houseId?: true
    stationId?: true
    sensorId?: true
    value?: true
    unit?: true
    quality?: true
    metadata?: true
    timestamp?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WeightReadingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightReading to aggregate.
     */
    where?: WeightReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightReadings to fetch.
     */
    orderBy?: WeightReadingOrderByWithRelationInput | WeightReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeightReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WeightReadings
    **/
    _count?: true | WeightReadingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeightReadingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeightReadingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeightReadingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeightReadingMaxAggregateInputType
  }

  export type GetWeightReadingAggregateType<T extends WeightReadingAggregateArgs> = {
        [P in keyof T & keyof AggregateWeightReading]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeightReading[P]>
      : GetScalarType<T[P], AggregateWeightReading[P]>
  }




  export type WeightReadingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeightReadingWhereInput
    orderBy?: WeightReadingOrderByWithAggregationInput | WeightReadingOrderByWithAggregationInput[]
    by: WeightReadingScalarFieldEnum[] | WeightReadingScalarFieldEnum
    having?: WeightReadingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeightReadingCountAggregateInputType | true
    _avg?: WeightReadingAvgAggregateInputType
    _sum?: WeightReadingSumAggregateInputType
    _min?: WeightReadingMinAggregateInputType
    _max?: WeightReadingMaxAggregateInputType
  }

  export type WeightReadingGroupByOutputType = {
    id: string
    tenantId: string
    farmId: string | null
    houseId: string | null
    stationId: string | null
    sensorId: string | null
    value: number
    unit: string
    quality: string
    metadata: JsonValue | null
    timestamp: Date
    createdAt: Date
    updatedAt: Date
    _count: WeightReadingCountAggregateOutputType | null
    _avg: WeightReadingAvgAggregateOutputType | null
    _sum: WeightReadingSumAggregateOutputType | null
    _min: WeightReadingMinAggregateOutputType | null
    _max: WeightReadingMaxAggregateOutputType | null
  }

  type GetWeightReadingGroupByPayload<T extends WeightReadingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeightReadingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeightReadingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeightReadingGroupByOutputType[P]>
            : GetScalarType<T[P], WeightReadingGroupByOutputType[P]>
        }
      >
    >


  export type WeightReadingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    farmId?: boolean
    houseId?: boolean
    stationId?: boolean
    sensorId?: boolean
    value?: boolean
    unit?: boolean
    quality?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightReading"]>

  export type WeightReadingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    farmId?: boolean
    houseId?: boolean
    stationId?: boolean
    sensorId?: boolean
    value?: boolean
    unit?: boolean
    quality?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightReading"]>

  export type WeightReadingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    farmId?: boolean
    houseId?: boolean
    stationId?: boolean
    sensorId?: boolean
    value?: boolean
    unit?: boolean
    quality?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightReading"]>

  export type WeightReadingSelectScalar = {
    id?: boolean
    tenantId?: boolean
    farmId?: boolean
    houseId?: boolean
    stationId?: boolean
    sensorId?: boolean
    value?: boolean
    unit?: boolean
    quality?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WeightReadingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "farmId" | "houseId" | "stationId" | "sensorId" | "value" | "unit" | "quality" | "metadata" | "timestamp" | "createdAt" | "updatedAt", ExtArgs["result"]["weightReading"]>

  export type $WeightReadingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WeightReading"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      farmId: string | null
      houseId: string | null
      stationId: string | null
      sensorId: string | null
      value: number
      unit: string
      quality: string
      metadata: Prisma.JsonValue | null
      timestamp: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["weightReading"]>
    composites: {}
  }

  type WeightReadingGetPayload<S extends boolean | null | undefined | WeightReadingDefaultArgs> = $Result.GetResult<Prisma.$WeightReadingPayload, S>

  type WeightReadingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeightReadingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WeightReadingCountAggregateInputType | true
    }

  export interface WeightReadingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WeightReading'], meta: { name: 'WeightReading' } }
    /**
     * Find zero or one WeightReading that matches the filter.
     * @param {WeightReadingFindUniqueArgs} args - Arguments to find a WeightReading
     * @example
     * // Get one WeightReading
     * const weightReading = await prisma.weightReading.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeightReadingFindUniqueArgs>(args: SelectSubset<T, WeightReadingFindUniqueArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WeightReading that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeightReadingFindUniqueOrThrowArgs} args - Arguments to find a WeightReading
     * @example
     * // Get one WeightReading
     * const weightReading = await prisma.weightReading.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeightReadingFindUniqueOrThrowArgs>(args: SelectSubset<T, WeightReadingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightReading that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightReadingFindFirstArgs} args - Arguments to find a WeightReading
     * @example
     * // Get one WeightReading
     * const weightReading = await prisma.weightReading.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeightReadingFindFirstArgs>(args?: SelectSubset<T, WeightReadingFindFirstArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightReading that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightReadingFindFirstOrThrowArgs} args - Arguments to find a WeightReading
     * @example
     * // Get one WeightReading
     * const weightReading = await prisma.weightReading.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeightReadingFindFirstOrThrowArgs>(args?: SelectSubset<T, WeightReadingFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WeightReadings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightReadingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeightReadings
     * const weightReadings = await prisma.weightReading.findMany()
     * 
     * // Get first 10 WeightReadings
     * const weightReadings = await prisma.weightReading.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weightReadingWithIdOnly = await prisma.weightReading.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeightReadingFindManyArgs>(args?: SelectSubset<T, WeightReadingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WeightReading.
     * @param {WeightReadingCreateArgs} args - Arguments to create a WeightReading.
     * @example
     * // Create one WeightReading
     * const WeightReading = await prisma.weightReading.create({
     *   data: {
     *     // ... data to create a WeightReading
     *   }
     * })
     * 
     */
    create<T extends WeightReadingCreateArgs>(args: SelectSubset<T, WeightReadingCreateArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WeightReadings.
     * @param {WeightReadingCreateManyArgs} args - Arguments to create many WeightReadings.
     * @example
     * // Create many WeightReadings
     * const weightReading = await prisma.weightReading.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeightReadingCreateManyArgs>(args?: SelectSubset<T, WeightReadingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WeightReadings and returns the data saved in the database.
     * @param {WeightReadingCreateManyAndReturnArgs} args - Arguments to create many WeightReadings.
     * @example
     * // Create many WeightReadings
     * const weightReading = await prisma.weightReading.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WeightReadings and only return the `id`
     * const weightReadingWithIdOnly = await prisma.weightReading.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WeightReadingCreateManyAndReturnArgs>(args?: SelectSubset<T, WeightReadingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WeightReading.
     * @param {WeightReadingDeleteArgs} args - Arguments to delete one WeightReading.
     * @example
     * // Delete one WeightReading
     * const WeightReading = await prisma.weightReading.delete({
     *   where: {
     *     // ... filter to delete one WeightReading
     *   }
     * })
     * 
     */
    delete<T extends WeightReadingDeleteArgs>(args: SelectSubset<T, WeightReadingDeleteArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WeightReading.
     * @param {WeightReadingUpdateArgs} args - Arguments to update one WeightReading.
     * @example
     * // Update one WeightReading
     * const weightReading = await prisma.weightReading.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeightReadingUpdateArgs>(args: SelectSubset<T, WeightReadingUpdateArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WeightReadings.
     * @param {WeightReadingDeleteManyArgs} args - Arguments to filter WeightReadings to delete.
     * @example
     * // Delete a few WeightReadings
     * const { count } = await prisma.weightReading.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeightReadingDeleteManyArgs>(args?: SelectSubset<T, WeightReadingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightReadings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightReadingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeightReadings
     * const weightReading = await prisma.weightReading.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeightReadingUpdateManyArgs>(args: SelectSubset<T, WeightReadingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightReadings and returns the data updated in the database.
     * @param {WeightReadingUpdateManyAndReturnArgs} args - Arguments to update many WeightReadings.
     * @example
     * // Update many WeightReadings
     * const weightReading = await prisma.weightReading.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WeightReadings and only return the `id`
     * const weightReadingWithIdOnly = await prisma.weightReading.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WeightReadingUpdateManyAndReturnArgs>(args: SelectSubset<T, WeightReadingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WeightReading.
     * @param {WeightReadingUpsertArgs} args - Arguments to update or create a WeightReading.
     * @example
     * // Update or create a WeightReading
     * const weightReading = await prisma.weightReading.upsert({
     *   create: {
     *     // ... data to create a WeightReading
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeightReading we want to update
     *   }
     * })
     */
    upsert<T extends WeightReadingUpsertArgs>(args: SelectSubset<T, WeightReadingUpsertArgs<ExtArgs>>): Prisma__WeightReadingClient<$Result.GetResult<Prisma.$WeightReadingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WeightReadings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightReadingCountArgs} args - Arguments to filter WeightReadings to count.
     * @example
     * // Count the number of WeightReadings
     * const count = await prisma.weightReading.count({
     *   where: {
     *     // ... the filter for the WeightReadings we want to count
     *   }
     * })
    **/
    count<T extends WeightReadingCountArgs>(
      args?: Subset<T, WeightReadingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeightReadingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WeightReading.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightReadingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WeightReadingAggregateArgs>(args: Subset<T, WeightReadingAggregateArgs>): Prisma.PrismaPromise<GetWeightReadingAggregateType<T>>

    /**
     * Group by WeightReading.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightReadingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WeightReadingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeightReadingGroupByArgs['orderBy'] }
        : { orderBy?: WeightReadingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WeightReadingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeightReadingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WeightReading model
   */
  readonly fields: WeightReadingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeightReading.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeightReadingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WeightReading model
   */
  interface WeightReadingFieldRefs {
    readonly id: FieldRef<"WeightReading", 'String'>
    readonly tenantId: FieldRef<"WeightReading", 'String'>
    readonly farmId: FieldRef<"WeightReading", 'String'>
    readonly houseId: FieldRef<"WeightReading", 'String'>
    readonly stationId: FieldRef<"WeightReading", 'String'>
    readonly sensorId: FieldRef<"WeightReading", 'String'>
    readonly value: FieldRef<"WeightReading", 'Float'>
    readonly unit: FieldRef<"WeightReading", 'String'>
    readonly quality: FieldRef<"WeightReading", 'String'>
    readonly metadata: FieldRef<"WeightReading", 'Json'>
    readonly timestamp: FieldRef<"WeightReading", 'DateTime'>
    readonly createdAt: FieldRef<"WeightReading", 'DateTime'>
    readonly updatedAt: FieldRef<"WeightReading", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WeightReading findUnique
   */
  export type WeightReadingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * Filter, which WeightReading to fetch.
     */
    where: WeightReadingWhereUniqueInput
  }

  /**
   * WeightReading findUniqueOrThrow
   */
  export type WeightReadingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * Filter, which WeightReading to fetch.
     */
    where: WeightReadingWhereUniqueInput
  }

  /**
   * WeightReading findFirst
   */
  export type WeightReadingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * Filter, which WeightReading to fetch.
     */
    where?: WeightReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightReadings to fetch.
     */
    orderBy?: WeightReadingOrderByWithRelationInput | WeightReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightReadings.
     */
    cursor?: WeightReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightReadings.
     */
    distinct?: WeightReadingScalarFieldEnum | WeightReadingScalarFieldEnum[]
  }

  /**
   * WeightReading findFirstOrThrow
   */
  export type WeightReadingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * Filter, which WeightReading to fetch.
     */
    where?: WeightReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightReadings to fetch.
     */
    orderBy?: WeightReadingOrderByWithRelationInput | WeightReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightReadings.
     */
    cursor?: WeightReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightReadings.
     */
    distinct?: WeightReadingScalarFieldEnum | WeightReadingScalarFieldEnum[]
  }

  /**
   * WeightReading findMany
   */
  export type WeightReadingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * Filter, which WeightReadings to fetch.
     */
    where?: WeightReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightReadings to fetch.
     */
    orderBy?: WeightReadingOrderByWithRelationInput | WeightReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WeightReadings.
     */
    cursor?: WeightReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightReadings.
     */
    skip?: number
    distinct?: WeightReadingScalarFieldEnum | WeightReadingScalarFieldEnum[]
  }

  /**
   * WeightReading create
   */
  export type WeightReadingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * The data needed to create a WeightReading.
     */
    data: XOR<WeightReadingCreateInput, WeightReadingUncheckedCreateInput>
  }

  /**
   * WeightReading createMany
   */
  export type WeightReadingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeightReadings.
     */
    data: WeightReadingCreateManyInput | WeightReadingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightReading createManyAndReturn
   */
  export type WeightReadingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * The data used to create many WeightReadings.
     */
    data: WeightReadingCreateManyInput | WeightReadingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightReading update
   */
  export type WeightReadingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * The data needed to update a WeightReading.
     */
    data: XOR<WeightReadingUpdateInput, WeightReadingUncheckedUpdateInput>
    /**
     * Choose, which WeightReading to update.
     */
    where: WeightReadingWhereUniqueInput
  }

  /**
   * WeightReading updateMany
   */
  export type WeightReadingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WeightReadings.
     */
    data: XOR<WeightReadingUpdateManyMutationInput, WeightReadingUncheckedUpdateManyInput>
    /**
     * Filter which WeightReadings to update
     */
    where?: WeightReadingWhereInput
    /**
     * Limit how many WeightReadings to update.
     */
    limit?: number
  }

  /**
   * WeightReading updateManyAndReturn
   */
  export type WeightReadingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * The data used to update WeightReadings.
     */
    data: XOR<WeightReadingUpdateManyMutationInput, WeightReadingUncheckedUpdateManyInput>
    /**
     * Filter which WeightReadings to update
     */
    where?: WeightReadingWhereInput
    /**
     * Limit how many WeightReadings to update.
     */
    limit?: number
  }

  /**
   * WeightReading upsert
   */
  export type WeightReadingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * The filter to search for the WeightReading to update in case it exists.
     */
    where: WeightReadingWhereUniqueInput
    /**
     * In case the WeightReading found by the `where` argument doesn't exist, create a new WeightReading with this data.
     */
    create: XOR<WeightReadingCreateInput, WeightReadingUncheckedCreateInput>
    /**
     * In case the WeightReading was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeightReadingUpdateInput, WeightReadingUncheckedUpdateInput>
  }

  /**
   * WeightReading delete
   */
  export type WeightReadingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
    /**
     * Filter which WeightReading to delete.
     */
    where: WeightReadingWhereUniqueInput
  }

  /**
   * WeightReading deleteMany
   */
  export type WeightReadingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightReadings to delete
     */
    where?: WeightReadingWhereInput
    /**
     * Limit how many WeightReadings to delete.
     */
    limit?: number
  }

  /**
   * WeightReading without action
   */
  export type WeightReadingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightReading
     */
    select?: WeightReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightReading
     */
    omit?: WeightReadingOmit<ExtArgs> | null
  }


  /**
   * Model LabReading
   */

  export type AggregateLabReading = {
    _count: LabReadingCountAggregateOutputType | null
    _avg: LabReadingAvgAggregateOutputType | null
    _sum: LabReadingSumAggregateOutputType | null
    _min: LabReadingMinAggregateOutputType | null
    _max: LabReadingMaxAggregateOutputType | null
  }

  export type LabReadingAvgAggregateOutputType = {
    value: number | null
  }

  export type LabReadingSumAggregateOutputType = {
    value: number | null
  }

  export type LabReadingMinAggregateOutputType = {
    id: string | null
    sampleId: string | null
    farmId: string | null
    tenantId: string | null
    testType: string | null
    value: number | null
    unit: string | null
    result: string | null
    timestamp: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LabReadingMaxAggregateOutputType = {
    id: string | null
    sampleId: string | null
    farmId: string | null
    tenantId: string | null
    testType: string | null
    value: number | null
    unit: string | null
    result: string | null
    timestamp: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LabReadingCountAggregateOutputType = {
    id: number
    sampleId: number
    farmId: number
    tenantId: number
    testType: number
    value: number
    unit: number
    result: number
    metadata: number
    timestamp: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LabReadingAvgAggregateInputType = {
    value?: true
  }

  export type LabReadingSumAggregateInputType = {
    value?: true
  }

  export type LabReadingMinAggregateInputType = {
    id?: true
    sampleId?: true
    farmId?: true
    tenantId?: true
    testType?: true
    value?: true
    unit?: true
    result?: true
    timestamp?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LabReadingMaxAggregateInputType = {
    id?: true
    sampleId?: true
    farmId?: true
    tenantId?: true
    testType?: true
    value?: true
    unit?: true
    result?: true
    timestamp?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LabReadingCountAggregateInputType = {
    id?: true
    sampleId?: true
    farmId?: true
    tenantId?: true
    testType?: true
    value?: true
    unit?: true
    result?: true
    metadata?: true
    timestamp?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LabReadingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LabReading to aggregate.
     */
    where?: LabReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabReadings to fetch.
     */
    orderBy?: LabReadingOrderByWithRelationInput | LabReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LabReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LabReadings
    **/
    _count?: true | LabReadingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LabReadingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LabReadingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LabReadingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LabReadingMaxAggregateInputType
  }

  export type GetLabReadingAggregateType<T extends LabReadingAggregateArgs> = {
        [P in keyof T & keyof AggregateLabReading]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLabReading[P]>
      : GetScalarType<T[P], AggregateLabReading[P]>
  }




  export type LabReadingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LabReadingWhereInput
    orderBy?: LabReadingOrderByWithAggregationInput | LabReadingOrderByWithAggregationInput[]
    by: LabReadingScalarFieldEnum[] | LabReadingScalarFieldEnum
    having?: LabReadingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LabReadingCountAggregateInputType | true
    _avg?: LabReadingAvgAggregateInputType
    _sum?: LabReadingSumAggregateInputType
    _min?: LabReadingMinAggregateInputType
    _max?: LabReadingMaxAggregateInputType
  }

  export type LabReadingGroupByOutputType = {
    id: string
    sampleId: string
    farmId: string | null
    tenantId: string
    testType: string
    value: number
    unit: string
    result: string | null
    metadata: JsonValue | null
    timestamp: Date
    createdAt: Date
    updatedAt: Date
    _count: LabReadingCountAggregateOutputType | null
    _avg: LabReadingAvgAggregateOutputType | null
    _sum: LabReadingSumAggregateOutputType | null
    _min: LabReadingMinAggregateOutputType | null
    _max: LabReadingMaxAggregateOutputType | null
  }

  type GetLabReadingGroupByPayload<T extends LabReadingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LabReadingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LabReadingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LabReadingGroupByOutputType[P]>
            : GetScalarType<T[P], LabReadingGroupByOutputType[P]>
        }
      >
    >


  export type LabReadingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sampleId?: boolean
    farmId?: boolean
    tenantId?: boolean
    testType?: boolean
    value?: boolean
    unit?: boolean
    result?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["labReading"]>

  export type LabReadingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sampleId?: boolean
    farmId?: boolean
    tenantId?: boolean
    testType?: boolean
    value?: boolean
    unit?: boolean
    result?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["labReading"]>

  export type LabReadingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sampleId?: boolean
    farmId?: boolean
    tenantId?: boolean
    testType?: boolean
    value?: boolean
    unit?: boolean
    result?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["labReading"]>

  export type LabReadingSelectScalar = {
    id?: boolean
    sampleId?: boolean
    farmId?: boolean
    tenantId?: boolean
    testType?: boolean
    value?: boolean
    unit?: boolean
    result?: boolean
    metadata?: boolean
    timestamp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type LabReadingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sampleId" | "farmId" | "tenantId" | "testType" | "value" | "unit" | "result" | "metadata" | "timestamp" | "createdAt" | "updatedAt", ExtArgs["result"]["labReading"]>

  export type $LabReadingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LabReading"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sampleId: string
      farmId: string | null
      tenantId: string
      testType: string
      value: number
      unit: string
      result: string | null
      metadata: Prisma.JsonValue | null
      timestamp: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["labReading"]>
    composites: {}
  }

  type LabReadingGetPayload<S extends boolean | null | undefined | LabReadingDefaultArgs> = $Result.GetResult<Prisma.$LabReadingPayload, S>

  type LabReadingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LabReadingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LabReadingCountAggregateInputType | true
    }

  export interface LabReadingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LabReading'], meta: { name: 'LabReading' } }
    /**
     * Find zero or one LabReading that matches the filter.
     * @param {LabReadingFindUniqueArgs} args - Arguments to find a LabReading
     * @example
     * // Get one LabReading
     * const labReading = await prisma.labReading.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LabReadingFindUniqueArgs>(args: SelectSubset<T, LabReadingFindUniqueArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LabReading that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LabReadingFindUniqueOrThrowArgs} args - Arguments to find a LabReading
     * @example
     * // Get one LabReading
     * const labReading = await prisma.labReading.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LabReadingFindUniqueOrThrowArgs>(args: SelectSubset<T, LabReadingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LabReading that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabReadingFindFirstArgs} args - Arguments to find a LabReading
     * @example
     * // Get one LabReading
     * const labReading = await prisma.labReading.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LabReadingFindFirstArgs>(args?: SelectSubset<T, LabReadingFindFirstArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LabReading that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabReadingFindFirstOrThrowArgs} args - Arguments to find a LabReading
     * @example
     * // Get one LabReading
     * const labReading = await prisma.labReading.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LabReadingFindFirstOrThrowArgs>(args?: SelectSubset<T, LabReadingFindFirstOrThrowArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LabReadings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabReadingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LabReadings
     * const labReadings = await prisma.labReading.findMany()
     * 
     * // Get first 10 LabReadings
     * const labReadings = await prisma.labReading.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const labReadingWithIdOnly = await prisma.labReading.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LabReadingFindManyArgs>(args?: SelectSubset<T, LabReadingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LabReading.
     * @param {LabReadingCreateArgs} args - Arguments to create a LabReading.
     * @example
     * // Create one LabReading
     * const LabReading = await prisma.labReading.create({
     *   data: {
     *     // ... data to create a LabReading
     *   }
     * })
     * 
     */
    create<T extends LabReadingCreateArgs>(args: SelectSubset<T, LabReadingCreateArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LabReadings.
     * @param {LabReadingCreateManyArgs} args - Arguments to create many LabReadings.
     * @example
     * // Create many LabReadings
     * const labReading = await prisma.labReading.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LabReadingCreateManyArgs>(args?: SelectSubset<T, LabReadingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LabReadings and returns the data saved in the database.
     * @param {LabReadingCreateManyAndReturnArgs} args - Arguments to create many LabReadings.
     * @example
     * // Create many LabReadings
     * const labReading = await prisma.labReading.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LabReadings and only return the `id`
     * const labReadingWithIdOnly = await prisma.labReading.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LabReadingCreateManyAndReturnArgs>(args?: SelectSubset<T, LabReadingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LabReading.
     * @param {LabReadingDeleteArgs} args - Arguments to delete one LabReading.
     * @example
     * // Delete one LabReading
     * const LabReading = await prisma.labReading.delete({
     *   where: {
     *     // ... filter to delete one LabReading
     *   }
     * })
     * 
     */
    delete<T extends LabReadingDeleteArgs>(args: SelectSubset<T, LabReadingDeleteArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LabReading.
     * @param {LabReadingUpdateArgs} args - Arguments to update one LabReading.
     * @example
     * // Update one LabReading
     * const labReading = await prisma.labReading.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LabReadingUpdateArgs>(args: SelectSubset<T, LabReadingUpdateArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LabReadings.
     * @param {LabReadingDeleteManyArgs} args - Arguments to filter LabReadings to delete.
     * @example
     * // Delete a few LabReadings
     * const { count } = await prisma.labReading.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LabReadingDeleteManyArgs>(args?: SelectSubset<T, LabReadingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LabReadings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabReadingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LabReadings
     * const labReading = await prisma.labReading.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LabReadingUpdateManyArgs>(args: SelectSubset<T, LabReadingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LabReadings and returns the data updated in the database.
     * @param {LabReadingUpdateManyAndReturnArgs} args - Arguments to update many LabReadings.
     * @example
     * // Update many LabReadings
     * const labReading = await prisma.labReading.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LabReadings and only return the `id`
     * const labReadingWithIdOnly = await prisma.labReading.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LabReadingUpdateManyAndReturnArgs>(args: SelectSubset<T, LabReadingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LabReading.
     * @param {LabReadingUpsertArgs} args - Arguments to update or create a LabReading.
     * @example
     * // Update or create a LabReading
     * const labReading = await prisma.labReading.upsert({
     *   create: {
     *     // ... data to create a LabReading
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LabReading we want to update
     *   }
     * })
     */
    upsert<T extends LabReadingUpsertArgs>(args: SelectSubset<T, LabReadingUpsertArgs<ExtArgs>>): Prisma__LabReadingClient<$Result.GetResult<Prisma.$LabReadingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LabReadings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabReadingCountArgs} args - Arguments to filter LabReadings to count.
     * @example
     * // Count the number of LabReadings
     * const count = await prisma.labReading.count({
     *   where: {
     *     // ... the filter for the LabReadings we want to count
     *   }
     * })
    **/
    count<T extends LabReadingCountArgs>(
      args?: Subset<T, LabReadingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LabReadingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LabReading.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabReadingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LabReadingAggregateArgs>(args: Subset<T, LabReadingAggregateArgs>): Prisma.PrismaPromise<GetLabReadingAggregateType<T>>

    /**
     * Group by LabReading.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LabReadingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LabReadingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LabReadingGroupByArgs['orderBy'] }
        : { orderBy?: LabReadingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LabReadingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLabReadingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LabReading model
   */
  readonly fields: LabReadingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LabReading.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LabReadingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LabReading model
   */
  interface LabReadingFieldRefs {
    readonly id: FieldRef<"LabReading", 'String'>
    readonly sampleId: FieldRef<"LabReading", 'String'>
    readonly farmId: FieldRef<"LabReading", 'String'>
    readonly tenantId: FieldRef<"LabReading", 'String'>
    readonly testType: FieldRef<"LabReading", 'String'>
    readonly value: FieldRef<"LabReading", 'Float'>
    readonly unit: FieldRef<"LabReading", 'String'>
    readonly result: FieldRef<"LabReading", 'String'>
    readonly metadata: FieldRef<"LabReading", 'Json'>
    readonly timestamp: FieldRef<"LabReading", 'DateTime'>
    readonly createdAt: FieldRef<"LabReading", 'DateTime'>
    readonly updatedAt: FieldRef<"LabReading", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LabReading findUnique
   */
  export type LabReadingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * Filter, which LabReading to fetch.
     */
    where: LabReadingWhereUniqueInput
  }

  /**
   * LabReading findUniqueOrThrow
   */
  export type LabReadingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * Filter, which LabReading to fetch.
     */
    where: LabReadingWhereUniqueInput
  }

  /**
   * LabReading findFirst
   */
  export type LabReadingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * Filter, which LabReading to fetch.
     */
    where?: LabReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabReadings to fetch.
     */
    orderBy?: LabReadingOrderByWithRelationInput | LabReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LabReadings.
     */
    cursor?: LabReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LabReadings.
     */
    distinct?: LabReadingScalarFieldEnum | LabReadingScalarFieldEnum[]
  }

  /**
   * LabReading findFirstOrThrow
   */
  export type LabReadingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * Filter, which LabReading to fetch.
     */
    where?: LabReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabReadings to fetch.
     */
    orderBy?: LabReadingOrderByWithRelationInput | LabReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LabReadings.
     */
    cursor?: LabReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabReadings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LabReadings.
     */
    distinct?: LabReadingScalarFieldEnum | LabReadingScalarFieldEnum[]
  }

  /**
   * LabReading findMany
   */
  export type LabReadingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * Filter, which LabReadings to fetch.
     */
    where?: LabReadingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LabReadings to fetch.
     */
    orderBy?: LabReadingOrderByWithRelationInput | LabReadingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LabReadings.
     */
    cursor?: LabReadingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LabReadings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LabReadings.
     */
    skip?: number
    distinct?: LabReadingScalarFieldEnum | LabReadingScalarFieldEnum[]
  }

  /**
   * LabReading create
   */
  export type LabReadingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * The data needed to create a LabReading.
     */
    data: XOR<LabReadingCreateInput, LabReadingUncheckedCreateInput>
  }

  /**
   * LabReading createMany
   */
  export type LabReadingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LabReadings.
     */
    data: LabReadingCreateManyInput | LabReadingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LabReading createManyAndReturn
   */
  export type LabReadingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * The data used to create many LabReadings.
     */
    data: LabReadingCreateManyInput | LabReadingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LabReading update
   */
  export type LabReadingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * The data needed to update a LabReading.
     */
    data: XOR<LabReadingUpdateInput, LabReadingUncheckedUpdateInput>
    /**
     * Choose, which LabReading to update.
     */
    where: LabReadingWhereUniqueInput
  }

  /**
   * LabReading updateMany
   */
  export type LabReadingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LabReadings.
     */
    data: XOR<LabReadingUpdateManyMutationInput, LabReadingUncheckedUpdateManyInput>
    /**
     * Filter which LabReadings to update
     */
    where?: LabReadingWhereInput
    /**
     * Limit how many LabReadings to update.
     */
    limit?: number
  }

  /**
   * LabReading updateManyAndReturn
   */
  export type LabReadingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * The data used to update LabReadings.
     */
    data: XOR<LabReadingUpdateManyMutationInput, LabReadingUncheckedUpdateManyInput>
    /**
     * Filter which LabReadings to update
     */
    where?: LabReadingWhereInput
    /**
     * Limit how many LabReadings to update.
     */
    limit?: number
  }

  /**
   * LabReading upsert
   */
  export type LabReadingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * The filter to search for the LabReading to update in case it exists.
     */
    where: LabReadingWhereUniqueInput
    /**
     * In case the LabReading found by the `where` argument doesn't exist, create a new LabReading with this data.
     */
    create: XOR<LabReadingCreateInput, LabReadingUncheckedCreateInput>
    /**
     * In case the LabReading was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LabReadingUpdateInput, LabReadingUncheckedUpdateInput>
  }

  /**
   * LabReading delete
   */
  export type LabReadingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
    /**
     * Filter which LabReading to delete.
     */
    where: LabReadingWhereUniqueInput
  }

  /**
   * LabReading deleteMany
   */
  export type LabReadingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LabReadings to delete
     */
    where?: LabReadingWhereInput
    /**
     * Limit how many LabReadings to delete.
     */
    limit?: number
  }

  /**
   * LabReading without action
   */
  export type LabReadingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LabReading
     */
    select?: LabReadingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LabReading
     */
    omit?: LabReadingOmit<ExtArgs> | null
  }


  /**
   * Model WeightAssociation
   */

  export type AggregateWeightAssociation = {
    _count: WeightAssociationCountAggregateOutputType | null
    _avg: WeightAssociationAvgAggregateOutputType | null
    _sum: WeightAssociationSumAggregateOutputType | null
    _min: WeightAssociationMinAggregateOutputType | null
    _max: WeightAssociationMaxAggregateOutputType | null
  }

  export type WeightAssociationAvgAggregateOutputType = {
    deltaMs: number | null
    confidence: number | null
  }

  export type WeightAssociationSumAggregateOutputType = {
    deltaMs: number | null
    confidence: number | null
  }

  export type WeightAssociationMinAggregateOutputType = {
    id: string | null
    mediaId: string | null
    readingId: string | null
    deltaMs: number | null
    strategy: string | null
    confidence: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeightAssociationMaxAggregateOutputType = {
    id: string | null
    mediaId: string | null
    readingId: string | null
    deltaMs: number | null
    strategy: string | null
    confidence: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeightAssociationCountAggregateOutputType = {
    id: number
    mediaId: number
    readingId: number
    deltaMs: number
    strategy: number
    confidence: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WeightAssociationAvgAggregateInputType = {
    deltaMs?: true
    confidence?: true
  }

  export type WeightAssociationSumAggregateInputType = {
    deltaMs?: true
    confidence?: true
  }

  export type WeightAssociationMinAggregateInputType = {
    id?: true
    mediaId?: true
    readingId?: true
    deltaMs?: true
    strategy?: true
    confidence?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeightAssociationMaxAggregateInputType = {
    id?: true
    mediaId?: true
    readingId?: true
    deltaMs?: true
    strategy?: true
    confidence?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeightAssociationCountAggregateInputType = {
    id?: true
    mediaId?: true
    readingId?: true
    deltaMs?: true
    strategy?: true
    confidence?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WeightAssociationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightAssociation to aggregate.
     */
    where?: WeightAssociationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightAssociations to fetch.
     */
    orderBy?: WeightAssociationOrderByWithRelationInput | WeightAssociationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeightAssociationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightAssociations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightAssociations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WeightAssociations
    **/
    _count?: true | WeightAssociationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeightAssociationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeightAssociationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeightAssociationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeightAssociationMaxAggregateInputType
  }

  export type GetWeightAssociationAggregateType<T extends WeightAssociationAggregateArgs> = {
        [P in keyof T & keyof AggregateWeightAssociation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeightAssociation[P]>
      : GetScalarType<T[P], AggregateWeightAssociation[P]>
  }




  export type WeightAssociationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeightAssociationWhereInput
    orderBy?: WeightAssociationOrderByWithAggregationInput | WeightAssociationOrderByWithAggregationInput[]
    by: WeightAssociationScalarFieldEnum[] | WeightAssociationScalarFieldEnum
    having?: WeightAssociationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeightAssociationCountAggregateInputType | true
    _avg?: WeightAssociationAvgAggregateInputType
    _sum?: WeightAssociationSumAggregateInputType
    _min?: WeightAssociationMinAggregateInputType
    _max?: WeightAssociationMaxAggregateInputType
  }

  export type WeightAssociationGroupByOutputType = {
    id: string
    mediaId: string
    readingId: string
    deltaMs: number
    strategy: string
    confidence: number | null
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: WeightAssociationCountAggregateOutputType | null
    _avg: WeightAssociationAvgAggregateOutputType | null
    _sum: WeightAssociationSumAggregateOutputType | null
    _min: WeightAssociationMinAggregateOutputType | null
    _max: WeightAssociationMaxAggregateOutputType | null
  }

  type GetWeightAssociationGroupByPayload<T extends WeightAssociationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeightAssociationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeightAssociationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeightAssociationGroupByOutputType[P]>
            : GetScalarType<T[P], WeightAssociationGroupByOutputType[P]>
        }
      >
    >


  export type WeightAssociationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaId?: boolean
    readingId?: boolean
    deltaMs?: boolean
    strategy?: boolean
    confidence?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightAssociation"]>

  export type WeightAssociationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaId?: boolean
    readingId?: boolean
    deltaMs?: boolean
    strategy?: boolean
    confidence?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightAssociation"]>

  export type WeightAssociationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaId?: boolean
    readingId?: boolean
    deltaMs?: boolean
    strategy?: boolean
    confidence?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightAssociation"]>

  export type WeightAssociationSelectScalar = {
    id?: boolean
    mediaId?: boolean
    readingId?: boolean
    deltaMs?: boolean
    strategy?: boolean
    confidence?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WeightAssociationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "mediaId" | "readingId" | "deltaMs" | "strategy" | "confidence" | "metadata" | "createdAt" | "updatedAt", ExtArgs["result"]["weightAssociation"]>

  export type $WeightAssociationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WeightAssociation"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      mediaId: string
      readingId: string
      deltaMs: number
      strategy: string
      confidence: number | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["weightAssociation"]>
    composites: {}
  }

  type WeightAssociationGetPayload<S extends boolean | null | undefined | WeightAssociationDefaultArgs> = $Result.GetResult<Prisma.$WeightAssociationPayload, S>

  type WeightAssociationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeightAssociationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WeightAssociationCountAggregateInputType | true
    }

  export interface WeightAssociationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WeightAssociation'], meta: { name: 'WeightAssociation' } }
    /**
     * Find zero or one WeightAssociation that matches the filter.
     * @param {WeightAssociationFindUniqueArgs} args - Arguments to find a WeightAssociation
     * @example
     * // Get one WeightAssociation
     * const weightAssociation = await prisma.weightAssociation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeightAssociationFindUniqueArgs>(args: SelectSubset<T, WeightAssociationFindUniqueArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WeightAssociation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeightAssociationFindUniqueOrThrowArgs} args - Arguments to find a WeightAssociation
     * @example
     * // Get one WeightAssociation
     * const weightAssociation = await prisma.weightAssociation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeightAssociationFindUniqueOrThrowArgs>(args: SelectSubset<T, WeightAssociationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightAssociation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightAssociationFindFirstArgs} args - Arguments to find a WeightAssociation
     * @example
     * // Get one WeightAssociation
     * const weightAssociation = await prisma.weightAssociation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeightAssociationFindFirstArgs>(args?: SelectSubset<T, WeightAssociationFindFirstArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightAssociation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightAssociationFindFirstOrThrowArgs} args - Arguments to find a WeightAssociation
     * @example
     * // Get one WeightAssociation
     * const weightAssociation = await prisma.weightAssociation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeightAssociationFindFirstOrThrowArgs>(args?: SelectSubset<T, WeightAssociationFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WeightAssociations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightAssociationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeightAssociations
     * const weightAssociations = await prisma.weightAssociation.findMany()
     * 
     * // Get first 10 WeightAssociations
     * const weightAssociations = await prisma.weightAssociation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weightAssociationWithIdOnly = await prisma.weightAssociation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeightAssociationFindManyArgs>(args?: SelectSubset<T, WeightAssociationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WeightAssociation.
     * @param {WeightAssociationCreateArgs} args - Arguments to create a WeightAssociation.
     * @example
     * // Create one WeightAssociation
     * const WeightAssociation = await prisma.weightAssociation.create({
     *   data: {
     *     // ... data to create a WeightAssociation
     *   }
     * })
     * 
     */
    create<T extends WeightAssociationCreateArgs>(args: SelectSubset<T, WeightAssociationCreateArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WeightAssociations.
     * @param {WeightAssociationCreateManyArgs} args - Arguments to create many WeightAssociations.
     * @example
     * // Create many WeightAssociations
     * const weightAssociation = await prisma.weightAssociation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeightAssociationCreateManyArgs>(args?: SelectSubset<T, WeightAssociationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WeightAssociations and returns the data saved in the database.
     * @param {WeightAssociationCreateManyAndReturnArgs} args - Arguments to create many WeightAssociations.
     * @example
     * // Create many WeightAssociations
     * const weightAssociation = await prisma.weightAssociation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WeightAssociations and only return the `id`
     * const weightAssociationWithIdOnly = await prisma.weightAssociation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WeightAssociationCreateManyAndReturnArgs>(args?: SelectSubset<T, WeightAssociationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WeightAssociation.
     * @param {WeightAssociationDeleteArgs} args - Arguments to delete one WeightAssociation.
     * @example
     * // Delete one WeightAssociation
     * const WeightAssociation = await prisma.weightAssociation.delete({
     *   where: {
     *     // ... filter to delete one WeightAssociation
     *   }
     * })
     * 
     */
    delete<T extends WeightAssociationDeleteArgs>(args: SelectSubset<T, WeightAssociationDeleteArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WeightAssociation.
     * @param {WeightAssociationUpdateArgs} args - Arguments to update one WeightAssociation.
     * @example
     * // Update one WeightAssociation
     * const weightAssociation = await prisma.weightAssociation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeightAssociationUpdateArgs>(args: SelectSubset<T, WeightAssociationUpdateArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WeightAssociations.
     * @param {WeightAssociationDeleteManyArgs} args - Arguments to filter WeightAssociations to delete.
     * @example
     * // Delete a few WeightAssociations
     * const { count } = await prisma.weightAssociation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeightAssociationDeleteManyArgs>(args?: SelectSubset<T, WeightAssociationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightAssociations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightAssociationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeightAssociations
     * const weightAssociation = await prisma.weightAssociation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeightAssociationUpdateManyArgs>(args: SelectSubset<T, WeightAssociationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightAssociations and returns the data updated in the database.
     * @param {WeightAssociationUpdateManyAndReturnArgs} args - Arguments to update many WeightAssociations.
     * @example
     * // Update many WeightAssociations
     * const weightAssociation = await prisma.weightAssociation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WeightAssociations and only return the `id`
     * const weightAssociationWithIdOnly = await prisma.weightAssociation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WeightAssociationUpdateManyAndReturnArgs>(args: SelectSubset<T, WeightAssociationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WeightAssociation.
     * @param {WeightAssociationUpsertArgs} args - Arguments to update or create a WeightAssociation.
     * @example
     * // Update or create a WeightAssociation
     * const weightAssociation = await prisma.weightAssociation.upsert({
     *   create: {
     *     // ... data to create a WeightAssociation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeightAssociation we want to update
     *   }
     * })
     */
    upsert<T extends WeightAssociationUpsertArgs>(args: SelectSubset<T, WeightAssociationUpsertArgs<ExtArgs>>): Prisma__WeightAssociationClient<$Result.GetResult<Prisma.$WeightAssociationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WeightAssociations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightAssociationCountArgs} args - Arguments to filter WeightAssociations to count.
     * @example
     * // Count the number of WeightAssociations
     * const count = await prisma.weightAssociation.count({
     *   where: {
     *     // ... the filter for the WeightAssociations we want to count
     *   }
     * })
    **/
    count<T extends WeightAssociationCountArgs>(
      args?: Subset<T, WeightAssociationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeightAssociationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WeightAssociation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightAssociationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WeightAssociationAggregateArgs>(args: Subset<T, WeightAssociationAggregateArgs>): Prisma.PrismaPromise<GetWeightAssociationAggregateType<T>>

    /**
     * Group by WeightAssociation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightAssociationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WeightAssociationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeightAssociationGroupByArgs['orderBy'] }
        : { orderBy?: WeightAssociationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WeightAssociationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeightAssociationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WeightAssociation model
   */
  readonly fields: WeightAssociationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeightAssociation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeightAssociationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WeightAssociation model
   */
  interface WeightAssociationFieldRefs {
    readonly id: FieldRef<"WeightAssociation", 'String'>
    readonly mediaId: FieldRef<"WeightAssociation", 'String'>
    readonly readingId: FieldRef<"WeightAssociation", 'String'>
    readonly deltaMs: FieldRef<"WeightAssociation", 'Int'>
    readonly strategy: FieldRef<"WeightAssociation", 'String'>
    readonly confidence: FieldRef<"WeightAssociation", 'Float'>
    readonly metadata: FieldRef<"WeightAssociation", 'Json'>
    readonly createdAt: FieldRef<"WeightAssociation", 'DateTime'>
    readonly updatedAt: FieldRef<"WeightAssociation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WeightAssociation findUnique
   */
  export type WeightAssociationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * Filter, which WeightAssociation to fetch.
     */
    where: WeightAssociationWhereUniqueInput
  }

  /**
   * WeightAssociation findUniqueOrThrow
   */
  export type WeightAssociationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * Filter, which WeightAssociation to fetch.
     */
    where: WeightAssociationWhereUniqueInput
  }

  /**
   * WeightAssociation findFirst
   */
  export type WeightAssociationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * Filter, which WeightAssociation to fetch.
     */
    where?: WeightAssociationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightAssociations to fetch.
     */
    orderBy?: WeightAssociationOrderByWithRelationInput | WeightAssociationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightAssociations.
     */
    cursor?: WeightAssociationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightAssociations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightAssociations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightAssociations.
     */
    distinct?: WeightAssociationScalarFieldEnum | WeightAssociationScalarFieldEnum[]
  }

  /**
   * WeightAssociation findFirstOrThrow
   */
  export type WeightAssociationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * Filter, which WeightAssociation to fetch.
     */
    where?: WeightAssociationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightAssociations to fetch.
     */
    orderBy?: WeightAssociationOrderByWithRelationInput | WeightAssociationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightAssociations.
     */
    cursor?: WeightAssociationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightAssociations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightAssociations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightAssociations.
     */
    distinct?: WeightAssociationScalarFieldEnum | WeightAssociationScalarFieldEnum[]
  }

  /**
   * WeightAssociation findMany
   */
  export type WeightAssociationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * Filter, which WeightAssociations to fetch.
     */
    where?: WeightAssociationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightAssociations to fetch.
     */
    orderBy?: WeightAssociationOrderByWithRelationInput | WeightAssociationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WeightAssociations.
     */
    cursor?: WeightAssociationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightAssociations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightAssociations.
     */
    skip?: number
    distinct?: WeightAssociationScalarFieldEnum | WeightAssociationScalarFieldEnum[]
  }

  /**
   * WeightAssociation create
   */
  export type WeightAssociationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * The data needed to create a WeightAssociation.
     */
    data: XOR<WeightAssociationCreateInput, WeightAssociationUncheckedCreateInput>
  }

  /**
   * WeightAssociation createMany
   */
  export type WeightAssociationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeightAssociations.
     */
    data: WeightAssociationCreateManyInput | WeightAssociationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightAssociation createManyAndReturn
   */
  export type WeightAssociationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * The data used to create many WeightAssociations.
     */
    data: WeightAssociationCreateManyInput | WeightAssociationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightAssociation update
   */
  export type WeightAssociationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * The data needed to update a WeightAssociation.
     */
    data: XOR<WeightAssociationUpdateInput, WeightAssociationUncheckedUpdateInput>
    /**
     * Choose, which WeightAssociation to update.
     */
    where: WeightAssociationWhereUniqueInput
  }

  /**
   * WeightAssociation updateMany
   */
  export type WeightAssociationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WeightAssociations.
     */
    data: XOR<WeightAssociationUpdateManyMutationInput, WeightAssociationUncheckedUpdateManyInput>
    /**
     * Filter which WeightAssociations to update
     */
    where?: WeightAssociationWhereInput
    /**
     * Limit how many WeightAssociations to update.
     */
    limit?: number
  }

  /**
   * WeightAssociation updateManyAndReturn
   */
  export type WeightAssociationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * The data used to update WeightAssociations.
     */
    data: XOR<WeightAssociationUpdateManyMutationInput, WeightAssociationUncheckedUpdateManyInput>
    /**
     * Filter which WeightAssociations to update
     */
    where?: WeightAssociationWhereInput
    /**
     * Limit how many WeightAssociations to update.
     */
    limit?: number
  }

  /**
   * WeightAssociation upsert
   */
  export type WeightAssociationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * The filter to search for the WeightAssociation to update in case it exists.
     */
    where: WeightAssociationWhereUniqueInput
    /**
     * In case the WeightAssociation found by the `where` argument doesn't exist, create a new WeightAssociation with this data.
     */
    create: XOR<WeightAssociationCreateInput, WeightAssociationUncheckedCreateInput>
    /**
     * In case the WeightAssociation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeightAssociationUpdateInput, WeightAssociationUncheckedUpdateInput>
  }

  /**
   * WeightAssociation delete
   */
  export type WeightAssociationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
    /**
     * Filter which WeightAssociation to delete.
     */
    where: WeightAssociationWhereUniqueInput
  }

  /**
   * WeightAssociation deleteMany
   */
  export type WeightAssociationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightAssociations to delete
     */
    where?: WeightAssociationWhereInput
    /**
     * Limit how many WeightAssociations to delete.
     */
    limit?: number
  }

  /**
   * WeightAssociation without action
   */
  export type WeightAssociationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightAssociation
     */
    select?: WeightAssociationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightAssociation
     */
    omit?: WeightAssociationOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const WeightReadingScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    farmId: 'farmId',
    houseId: 'houseId',
    stationId: 'stationId',
    sensorId: 'sensorId',
    value: 'value',
    unit: 'unit',
    quality: 'quality',
    metadata: 'metadata',
    timestamp: 'timestamp',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WeightReadingScalarFieldEnum = (typeof WeightReadingScalarFieldEnum)[keyof typeof WeightReadingScalarFieldEnum]


  export const LabReadingScalarFieldEnum: {
    id: 'id',
    sampleId: 'sampleId',
    farmId: 'farmId',
    tenantId: 'tenantId',
    testType: 'testType',
    value: 'value',
    unit: 'unit',
    result: 'result',
    metadata: 'metadata',
    timestamp: 'timestamp',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LabReadingScalarFieldEnum = (typeof LabReadingScalarFieldEnum)[keyof typeof LabReadingScalarFieldEnum]


  export const WeightAssociationScalarFieldEnum: {
    id: 'id',
    mediaId: 'mediaId',
    readingId: 'readingId',
    deltaMs: 'deltaMs',
    strategy: 'strategy',
    confidence: 'confidence',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WeightAssociationScalarFieldEnum = (typeof WeightAssociationScalarFieldEnum)[keyof typeof WeightAssociationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type WeightReadingWhereInput = {
    AND?: WeightReadingWhereInput | WeightReadingWhereInput[]
    OR?: WeightReadingWhereInput[]
    NOT?: WeightReadingWhereInput | WeightReadingWhereInput[]
    id?: StringFilter<"WeightReading"> | string
    tenantId?: StringFilter<"WeightReading"> | string
    farmId?: StringNullableFilter<"WeightReading"> | string | null
    houseId?: StringNullableFilter<"WeightReading"> | string | null
    stationId?: StringNullableFilter<"WeightReading"> | string | null
    sensorId?: StringNullableFilter<"WeightReading"> | string | null
    value?: FloatFilter<"WeightReading"> | number
    unit?: StringFilter<"WeightReading"> | string
    quality?: StringFilter<"WeightReading"> | string
    metadata?: JsonNullableFilter<"WeightReading">
    timestamp?: DateTimeFilter<"WeightReading"> | Date | string
    createdAt?: DateTimeFilter<"WeightReading"> | Date | string
    updatedAt?: DateTimeFilter<"WeightReading"> | Date | string
  }

  export type WeightReadingOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    farmId?: SortOrderInput | SortOrder
    houseId?: SortOrderInput | SortOrder
    stationId?: SortOrderInput | SortOrder
    sensorId?: SortOrderInput | SortOrder
    value?: SortOrder
    unit?: SortOrder
    quality?: SortOrder
    metadata?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightReadingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WeightReadingWhereInput | WeightReadingWhereInput[]
    OR?: WeightReadingWhereInput[]
    NOT?: WeightReadingWhereInput | WeightReadingWhereInput[]
    tenantId?: StringFilter<"WeightReading"> | string
    farmId?: StringNullableFilter<"WeightReading"> | string | null
    houseId?: StringNullableFilter<"WeightReading"> | string | null
    stationId?: StringNullableFilter<"WeightReading"> | string | null
    sensorId?: StringNullableFilter<"WeightReading"> | string | null
    value?: FloatFilter<"WeightReading"> | number
    unit?: StringFilter<"WeightReading"> | string
    quality?: StringFilter<"WeightReading"> | string
    metadata?: JsonNullableFilter<"WeightReading">
    timestamp?: DateTimeFilter<"WeightReading"> | Date | string
    createdAt?: DateTimeFilter<"WeightReading"> | Date | string
    updatedAt?: DateTimeFilter<"WeightReading"> | Date | string
  }, "id">

  export type WeightReadingOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    farmId?: SortOrderInput | SortOrder
    houseId?: SortOrderInput | SortOrder
    stationId?: SortOrderInput | SortOrder
    sensorId?: SortOrderInput | SortOrder
    value?: SortOrder
    unit?: SortOrder
    quality?: SortOrder
    metadata?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WeightReadingCountOrderByAggregateInput
    _avg?: WeightReadingAvgOrderByAggregateInput
    _max?: WeightReadingMaxOrderByAggregateInput
    _min?: WeightReadingMinOrderByAggregateInput
    _sum?: WeightReadingSumOrderByAggregateInput
  }

  export type WeightReadingScalarWhereWithAggregatesInput = {
    AND?: WeightReadingScalarWhereWithAggregatesInput | WeightReadingScalarWhereWithAggregatesInput[]
    OR?: WeightReadingScalarWhereWithAggregatesInput[]
    NOT?: WeightReadingScalarWhereWithAggregatesInput | WeightReadingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WeightReading"> | string
    tenantId?: StringWithAggregatesFilter<"WeightReading"> | string
    farmId?: StringNullableWithAggregatesFilter<"WeightReading"> | string | null
    houseId?: StringNullableWithAggregatesFilter<"WeightReading"> | string | null
    stationId?: StringNullableWithAggregatesFilter<"WeightReading"> | string | null
    sensorId?: StringNullableWithAggregatesFilter<"WeightReading"> | string | null
    value?: FloatWithAggregatesFilter<"WeightReading"> | number
    unit?: StringWithAggregatesFilter<"WeightReading"> | string
    quality?: StringWithAggregatesFilter<"WeightReading"> | string
    metadata?: JsonNullableWithAggregatesFilter<"WeightReading">
    timestamp?: DateTimeWithAggregatesFilter<"WeightReading"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"WeightReading"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WeightReading"> | Date | string
  }

  export type LabReadingWhereInput = {
    AND?: LabReadingWhereInput | LabReadingWhereInput[]
    OR?: LabReadingWhereInput[]
    NOT?: LabReadingWhereInput | LabReadingWhereInput[]
    id?: StringFilter<"LabReading"> | string
    sampleId?: StringFilter<"LabReading"> | string
    farmId?: StringNullableFilter<"LabReading"> | string | null
    tenantId?: StringFilter<"LabReading"> | string
    testType?: StringFilter<"LabReading"> | string
    value?: FloatFilter<"LabReading"> | number
    unit?: StringFilter<"LabReading"> | string
    result?: StringNullableFilter<"LabReading"> | string | null
    metadata?: JsonNullableFilter<"LabReading">
    timestamp?: DateTimeFilter<"LabReading"> | Date | string
    createdAt?: DateTimeFilter<"LabReading"> | Date | string
    updatedAt?: DateTimeFilter<"LabReading"> | Date | string
  }

  export type LabReadingOrderByWithRelationInput = {
    id?: SortOrder
    sampleId?: SortOrder
    farmId?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    testType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    result?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LabReadingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sampleId?: string
    AND?: LabReadingWhereInput | LabReadingWhereInput[]
    OR?: LabReadingWhereInput[]
    NOT?: LabReadingWhereInput | LabReadingWhereInput[]
    farmId?: StringNullableFilter<"LabReading"> | string | null
    tenantId?: StringFilter<"LabReading"> | string
    testType?: StringFilter<"LabReading"> | string
    value?: FloatFilter<"LabReading"> | number
    unit?: StringFilter<"LabReading"> | string
    result?: StringNullableFilter<"LabReading"> | string | null
    metadata?: JsonNullableFilter<"LabReading">
    timestamp?: DateTimeFilter<"LabReading"> | Date | string
    createdAt?: DateTimeFilter<"LabReading"> | Date | string
    updatedAt?: DateTimeFilter<"LabReading"> | Date | string
  }, "id" | "sampleId">

  export type LabReadingOrderByWithAggregationInput = {
    id?: SortOrder
    sampleId?: SortOrder
    farmId?: SortOrderInput | SortOrder
    tenantId?: SortOrder
    testType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    result?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LabReadingCountOrderByAggregateInput
    _avg?: LabReadingAvgOrderByAggregateInput
    _max?: LabReadingMaxOrderByAggregateInput
    _min?: LabReadingMinOrderByAggregateInput
    _sum?: LabReadingSumOrderByAggregateInput
  }

  export type LabReadingScalarWhereWithAggregatesInput = {
    AND?: LabReadingScalarWhereWithAggregatesInput | LabReadingScalarWhereWithAggregatesInput[]
    OR?: LabReadingScalarWhereWithAggregatesInput[]
    NOT?: LabReadingScalarWhereWithAggregatesInput | LabReadingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LabReading"> | string
    sampleId?: StringWithAggregatesFilter<"LabReading"> | string
    farmId?: StringNullableWithAggregatesFilter<"LabReading"> | string | null
    tenantId?: StringWithAggregatesFilter<"LabReading"> | string
    testType?: StringWithAggregatesFilter<"LabReading"> | string
    value?: FloatWithAggregatesFilter<"LabReading"> | number
    unit?: StringWithAggregatesFilter<"LabReading"> | string
    result?: StringNullableWithAggregatesFilter<"LabReading"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"LabReading">
    timestamp?: DateTimeWithAggregatesFilter<"LabReading"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"LabReading"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"LabReading"> | Date | string
  }

  export type WeightAssociationWhereInput = {
    AND?: WeightAssociationWhereInput | WeightAssociationWhereInput[]
    OR?: WeightAssociationWhereInput[]
    NOT?: WeightAssociationWhereInput | WeightAssociationWhereInput[]
    id?: StringFilter<"WeightAssociation"> | string
    mediaId?: StringFilter<"WeightAssociation"> | string
    readingId?: StringFilter<"WeightAssociation"> | string
    deltaMs?: IntFilter<"WeightAssociation"> | number
    strategy?: StringFilter<"WeightAssociation"> | string
    confidence?: FloatNullableFilter<"WeightAssociation"> | number | null
    metadata?: JsonNullableFilter<"WeightAssociation">
    createdAt?: DateTimeFilter<"WeightAssociation"> | Date | string
    updatedAt?: DateTimeFilter<"WeightAssociation"> | Date | string
  }

  export type WeightAssociationOrderByWithRelationInput = {
    id?: SortOrder
    mediaId?: SortOrder
    readingId?: SortOrder
    deltaMs?: SortOrder
    strategy?: SortOrder
    confidence?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightAssociationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    mediaId_readingId?: WeightAssociationMediaIdReadingIdCompoundUniqueInput
    AND?: WeightAssociationWhereInput | WeightAssociationWhereInput[]
    OR?: WeightAssociationWhereInput[]
    NOT?: WeightAssociationWhereInput | WeightAssociationWhereInput[]
    mediaId?: StringFilter<"WeightAssociation"> | string
    readingId?: StringFilter<"WeightAssociation"> | string
    deltaMs?: IntFilter<"WeightAssociation"> | number
    strategy?: StringFilter<"WeightAssociation"> | string
    confidence?: FloatNullableFilter<"WeightAssociation"> | number | null
    metadata?: JsonNullableFilter<"WeightAssociation">
    createdAt?: DateTimeFilter<"WeightAssociation"> | Date | string
    updatedAt?: DateTimeFilter<"WeightAssociation"> | Date | string
  }, "id" | "mediaId_readingId">

  export type WeightAssociationOrderByWithAggregationInput = {
    id?: SortOrder
    mediaId?: SortOrder
    readingId?: SortOrder
    deltaMs?: SortOrder
    strategy?: SortOrder
    confidence?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WeightAssociationCountOrderByAggregateInput
    _avg?: WeightAssociationAvgOrderByAggregateInput
    _max?: WeightAssociationMaxOrderByAggregateInput
    _min?: WeightAssociationMinOrderByAggregateInput
    _sum?: WeightAssociationSumOrderByAggregateInput
  }

  export type WeightAssociationScalarWhereWithAggregatesInput = {
    AND?: WeightAssociationScalarWhereWithAggregatesInput | WeightAssociationScalarWhereWithAggregatesInput[]
    OR?: WeightAssociationScalarWhereWithAggregatesInput[]
    NOT?: WeightAssociationScalarWhereWithAggregatesInput | WeightAssociationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WeightAssociation"> | string
    mediaId?: StringWithAggregatesFilter<"WeightAssociation"> | string
    readingId?: StringWithAggregatesFilter<"WeightAssociation"> | string
    deltaMs?: IntWithAggregatesFilter<"WeightAssociation"> | number
    strategy?: StringWithAggregatesFilter<"WeightAssociation"> | string
    confidence?: FloatNullableWithAggregatesFilter<"WeightAssociation"> | number | null
    metadata?: JsonNullableWithAggregatesFilter<"WeightAssociation">
    createdAt?: DateTimeWithAggregatesFilter<"WeightAssociation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WeightAssociation"> | Date | string
  }

  export type WeightReadingCreateInput = {
    id?: string
    tenantId: string
    farmId?: string | null
    houseId?: string | null
    stationId?: string | null
    sensorId?: string | null
    value: number
    unit: string
    quality: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightReadingUncheckedCreateInput = {
    id?: string
    tenantId: string
    farmId?: string | null
    houseId?: string | null
    stationId?: string | null
    sensorId?: string | null
    value: number
    unit: string
    quality: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightReadingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    houseId?: NullableStringFieldUpdateOperationsInput | string | null
    stationId?: NullableStringFieldUpdateOperationsInput | string | null
    sensorId?: NullableStringFieldUpdateOperationsInput | string | null
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightReadingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    houseId?: NullableStringFieldUpdateOperationsInput | string | null
    stationId?: NullableStringFieldUpdateOperationsInput | string | null
    sensorId?: NullableStringFieldUpdateOperationsInput | string | null
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightReadingCreateManyInput = {
    id?: string
    tenantId: string
    farmId?: string | null
    houseId?: string | null
    stationId?: string | null
    sensorId?: string | null
    value: number
    unit: string
    quality: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightReadingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    houseId?: NullableStringFieldUpdateOperationsInput | string | null
    stationId?: NullableStringFieldUpdateOperationsInput | string | null
    sensorId?: NullableStringFieldUpdateOperationsInput | string | null
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightReadingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    houseId?: NullableStringFieldUpdateOperationsInput | string | null
    stationId?: NullableStringFieldUpdateOperationsInput | string | null
    sensorId?: NullableStringFieldUpdateOperationsInput | string | null
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    quality?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabReadingCreateInput = {
    id?: string
    sampleId: string
    farmId?: string | null
    tenantId: string
    testType: string
    value: number
    unit: string
    result?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LabReadingUncheckedCreateInput = {
    id?: string
    sampleId: string
    farmId?: string | null
    tenantId: string
    testType: string
    value: number
    unit: string
    result?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LabReadingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sampleId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    testType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    result?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabReadingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sampleId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    testType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    result?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabReadingCreateManyInput = {
    id?: string
    sampleId: string
    farmId?: string | null
    tenantId: string
    testType: string
    value: number
    unit: string
    result?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LabReadingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sampleId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    testType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    result?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LabReadingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sampleId?: StringFieldUpdateOperationsInput | string
    farmId?: NullableStringFieldUpdateOperationsInput | string | null
    tenantId?: StringFieldUpdateOperationsInput | string
    testType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    result?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightAssociationCreateInput = {
    id?: string
    mediaId: string
    readingId: string
    deltaMs: number
    strategy: string
    confidence?: number | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightAssociationUncheckedCreateInput = {
    id?: string
    mediaId: string
    readingId: string
    deltaMs: number
    strategy: string
    confidence?: number | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightAssociationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    readingId?: StringFieldUpdateOperationsInput | string
    deltaMs?: IntFieldUpdateOperationsInput | number
    strategy?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightAssociationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    readingId?: StringFieldUpdateOperationsInput | string
    deltaMs?: IntFieldUpdateOperationsInput | number
    strategy?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightAssociationCreateManyInput = {
    id?: string
    mediaId: string
    readingId: string
    deltaMs: number
    strategy: string
    confidence?: number | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightAssociationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    readingId?: StringFieldUpdateOperationsInput | string
    deltaMs?: IntFieldUpdateOperationsInput | number
    strategy?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightAssociationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    readingId?: StringFieldUpdateOperationsInput | string
    deltaMs?: IntFieldUpdateOperationsInput | number
    strategy?: StringFieldUpdateOperationsInput | string
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type WeightReadingCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    farmId?: SortOrder
    houseId?: SortOrder
    stationId?: SortOrder
    sensorId?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    quality?: SortOrder
    metadata?: SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightReadingAvgOrderByAggregateInput = {
    value?: SortOrder
  }

  export type WeightReadingMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    farmId?: SortOrder
    houseId?: SortOrder
    stationId?: SortOrder
    sensorId?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    quality?: SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightReadingMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    farmId?: SortOrder
    houseId?: SortOrder
    stationId?: SortOrder
    sensorId?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    quality?: SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightReadingSumOrderByAggregateInput = {
    value?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type LabReadingCountOrderByAggregateInput = {
    id?: SortOrder
    sampleId?: SortOrder
    farmId?: SortOrder
    tenantId?: SortOrder
    testType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    result?: SortOrder
    metadata?: SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LabReadingAvgOrderByAggregateInput = {
    value?: SortOrder
  }

  export type LabReadingMaxOrderByAggregateInput = {
    id?: SortOrder
    sampleId?: SortOrder
    farmId?: SortOrder
    tenantId?: SortOrder
    testType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    result?: SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LabReadingMinOrderByAggregateInput = {
    id?: SortOrder
    sampleId?: SortOrder
    farmId?: SortOrder
    tenantId?: SortOrder
    testType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    result?: SortOrder
    timestamp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LabReadingSumOrderByAggregateInput = {
    value?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type WeightAssociationMediaIdReadingIdCompoundUniqueInput = {
    mediaId: string
    readingId: string
  }

  export type WeightAssociationCountOrderByAggregateInput = {
    id?: SortOrder
    mediaId?: SortOrder
    readingId?: SortOrder
    deltaMs?: SortOrder
    strategy?: SortOrder
    confidence?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightAssociationAvgOrderByAggregateInput = {
    deltaMs?: SortOrder
    confidence?: SortOrder
  }

  export type WeightAssociationMaxOrderByAggregateInput = {
    id?: SortOrder
    mediaId?: SortOrder
    readingId?: SortOrder
    deltaMs?: SortOrder
    strategy?: SortOrder
    confidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightAssociationMinOrderByAggregateInput = {
    id?: SortOrder
    mediaId?: SortOrder
    readingId?: SortOrder
    deltaMs?: SortOrder
    strategy?: SortOrder
    confidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightAssociationSumOrderByAggregateInput = {
    deltaMs?: SortOrder
    confidence?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}