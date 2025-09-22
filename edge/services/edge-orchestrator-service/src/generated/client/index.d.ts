
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
 * Model DatasetExport
 * 
 */
export type DatasetExport = $Result.DefaultSelection<Prisma.$DatasetExportPayload>
/**
 * Model ModelRegistry
 * 
 */
export type ModelRegistry = $Result.DefaultSelection<Prisma.$ModelRegistryPayload>
/**
 * Model WeightMapping
 * 
 */
export type WeightMapping = $Result.DefaultSelection<Prisma.$WeightMappingPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more DatasetExports
 * const datasetExports = await prisma.datasetExport.findMany()
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
   * // Fetch zero or more DatasetExports
   * const datasetExports = await prisma.datasetExport.findMany()
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
   * `prisma.datasetExport`: Exposes CRUD operations for the **DatasetExport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DatasetExports
    * const datasetExports = await prisma.datasetExport.findMany()
    * ```
    */
  get datasetExport(): Prisma.DatasetExportDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.modelRegistry`: Exposes CRUD operations for the **ModelRegistry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ModelRegistries
    * const modelRegistries = await prisma.modelRegistry.findMany()
    * ```
    */
  get modelRegistry(): Prisma.ModelRegistryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.weightMapping`: Exposes CRUD operations for the **WeightMapping** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WeightMappings
    * const weightMappings = await prisma.weightMapping.findMany()
    * ```
    */
  get weightMapping(): Prisma.WeightMappingDelegate<ExtArgs, ClientOptions>;
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
    DatasetExport: 'DatasetExport',
    ModelRegistry: 'ModelRegistry',
    WeightMapping: 'WeightMapping'
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
      modelProps: "datasetExport" | "modelRegistry" | "weightMapping"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      DatasetExport: {
        payload: Prisma.$DatasetExportPayload<ExtArgs>
        fields: Prisma.DatasetExportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DatasetExportFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DatasetExportFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>
          }
          findFirst: {
            args: Prisma.DatasetExportFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DatasetExportFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>
          }
          findMany: {
            args: Prisma.DatasetExportFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>[]
          }
          create: {
            args: Prisma.DatasetExportCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>
          }
          createMany: {
            args: Prisma.DatasetExportCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DatasetExportCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>[]
          }
          delete: {
            args: Prisma.DatasetExportDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>
          }
          update: {
            args: Prisma.DatasetExportUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>
          }
          deleteMany: {
            args: Prisma.DatasetExportDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DatasetExportUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DatasetExportUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>[]
          }
          upsert: {
            args: Prisma.DatasetExportUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DatasetExportPayload>
          }
          aggregate: {
            args: Prisma.DatasetExportAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDatasetExport>
          }
          groupBy: {
            args: Prisma.DatasetExportGroupByArgs<ExtArgs>
            result: $Utils.Optional<DatasetExportGroupByOutputType>[]
          }
          count: {
            args: Prisma.DatasetExportCountArgs<ExtArgs>
            result: $Utils.Optional<DatasetExportCountAggregateOutputType> | number
          }
        }
      }
      ModelRegistry: {
        payload: Prisma.$ModelRegistryPayload<ExtArgs>
        fields: Prisma.ModelRegistryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ModelRegistryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ModelRegistryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>
          }
          findFirst: {
            args: Prisma.ModelRegistryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ModelRegistryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>
          }
          findMany: {
            args: Prisma.ModelRegistryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>[]
          }
          create: {
            args: Prisma.ModelRegistryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>
          }
          createMany: {
            args: Prisma.ModelRegistryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ModelRegistryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>[]
          }
          delete: {
            args: Prisma.ModelRegistryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>
          }
          update: {
            args: Prisma.ModelRegistryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>
          }
          deleteMany: {
            args: Prisma.ModelRegistryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ModelRegistryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ModelRegistryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>[]
          }
          upsert: {
            args: Prisma.ModelRegistryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ModelRegistryPayload>
          }
          aggregate: {
            args: Prisma.ModelRegistryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateModelRegistry>
          }
          groupBy: {
            args: Prisma.ModelRegistryGroupByArgs<ExtArgs>
            result: $Utils.Optional<ModelRegistryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ModelRegistryCountArgs<ExtArgs>
            result: $Utils.Optional<ModelRegistryCountAggregateOutputType> | number
          }
        }
      }
      WeightMapping: {
        payload: Prisma.$WeightMappingPayload<ExtArgs>
        fields: Prisma.WeightMappingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeightMappingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeightMappingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>
          }
          findFirst: {
            args: Prisma.WeightMappingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeightMappingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>
          }
          findMany: {
            args: Prisma.WeightMappingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>[]
          }
          create: {
            args: Prisma.WeightMappingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>
          }
          createMany: {
            args: Prisma.WeightMappingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WeightMappingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>[]
          }
          delete: {
            args: Prisma.WeightMappingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>
          }
          update: {
            args: Prisma.WeightMappingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>
          }
          deleteMany: {
            args: Prisma.WeightMappingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeightMappingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WeightMappingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>[]
          }
          upsert: {
            args: Prisma.WeightMappingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeightMappingPayload>
          }
          aggregate: {
            args: Prisma.WeightMappingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeightMapping>
          }
          groupBy: {
            args: Prisma.WeightMappingGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeightMappingGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeightMappingCountArgs<ExtArgs>
            result: $Utils.Optional<WeightMappingCountAggregateOutputType> | number
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
    datasetExport?: DatasetExportOmit
    modelRegistry?: ModelRegistryOmit
    weightMapping?: WeightMappingOmit
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
   * Model DatasetExport
   */

  export type AggregateDatasetExport = {
    _count: DatasetExportCountAggregateOutputType | null
    _avg: DatasetExportAvgAggregateOutputType | null
    _sum: DatasetExportSumAggregateOutputType | null
    _min: DatasetExportMinAggregateOutputType | null
    _max: DatasetExportMaxAggregateOutputType | null
  }

  export type DatasetExportAvgAggregateOutputType = {
    rows: number | null
  }

  export type DatasetExportSumAggregateOutputType = {
    rows: number | null
  }

  export type DatasetExportMinAggregateOutputType = {
    id: string | null
    datasetS3: string | null
    rows: number | null
    tenantId: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DatasetExportMaxAggregateOutputType = {
    id: string | null
    datasetS3: string | null
    rows: number | null
    tenantId: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DatasetExportCountAggregateOutputType = {
    id: number
    datasetS3: number
    rows: number
    metaJson: number
    tenantId: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DatasetExportAvgAggregateInputType = {
    rows?: true
  }

  export type DatasetExportSumAggregateInputType = {
    rows?: true
  }

  export type DatasetExportMinAggregateInputType = {
    id?: true
    datasetS3?: true
    rows?: true
    tenantId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DatasetExportMaxAggregateInputType = {
    id?: true
    datasetS3?: true
    rows?: true
    tenantId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DatasetExportCountAggregateInputType = {
    id?: true
    datasetS3?: true
    rows?: true
    metaJson?: true
    tenantId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DatasetExportAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatasetExport to aggregate.
     */
    where?: DatasetExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetExports to fetch.
     */
    orderBy?: DatasetExportOrderByWithRelationInput | DatasetExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DatasetExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetExports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetExports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DatasetExports
    **/
    _count?: true | DatasetExportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DatasetExportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DatasetExportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DatasetExportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DatasetExportMaxAggregateInputType
  }

  export type GetDatasetExportAggregateType<T extends DatasetExportAggregateArgs> = {
        [P in keyof T & keyof AggregateDatasetExport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDatasetExport[P]>
      : GetScalarType<T[P], AggregateDatasetExport[P]>
  }




  export type DatasetExportGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DatasetExportWhereInput
    orderBy?: DatasetExportOrderByWithAggregationInput | DatasetExportOrderByWithAggregationInput[]
    by: DatasetExportScalarFieldEnum[] | DatasetExportScalarFieldEnum
    having?: DatasetExportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DatasetExportCountAggregateInputType | true
    _avg?: DatasetExportAvgAggregateInputType
    _sum?: DatasetExportSumAggregateInputType
    _min?: DatasetExportMinAggregateInputType
    _max?: DatasetExportMaxAggregateInputType
  }

  export type DatasetExportGroupByOutputType = {
    id: string
    datasetS3: string
    rows: number
    metaJson: JsonValue | null
    tenantId: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    _count: DatasetExportCountAggregateOutputType | null
    _avg: DatasetExportAvgAggregateOutputType | null
    _sum: DatasetExportSumAggregateOutputType | null
    _min: DatasetExportMinAggregateOutputType | null
    _max: DatasetExportMaxAggregateOutputType | null
  }

  type GetDatasetExportGroupByPayload<T extends DatasetExportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DatasetExportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DatasetExportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DatasetExportGroupByOutputType[P]>
            : GetScalarType<T[P], DatasetExportGroupByOutputType[P]>
        }
      >
    >


  export type DatasetExportSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    datasetS3?: boolean
    rows?: boolean
    metaJson?: boolean
    tenantId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["datasetExport"]>

  export type DatasetExportSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    datasetS3?: boolean
    rows?: boolean
    metaJson?: boolean
    tenantId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["datasetExport"]>

  export type DatasetExportSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    datasetS3?: boolean
    rows?: boolean
    metaJson?: boolean
    tenantId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["datasetExport"]>

  export type DatasetExportSelectScalar = {
    id?: boolean
    datasetS3?: boolean
    rows?: boolean
    metaJson?: boolean
    tenantId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DatasetExportOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "datasetS3" | "rows" | "metaJson" | "tenantId" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["datasetExport"]>

  export type $DatasetExportPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DatasetExport"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      datasetS3: string
      rows: number
      metaJson: Prisma.JsonValue | null
      tenantId: string | null
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["datasetExport"]>
    composites: {}
  }

  type DatasetExportGetPayload<S extends boolean | null | undefined | DatasetExportDefaultArgs> = $Result.GetResult<Prisma.$DatasetExportPayload, S>

  type DatasetExportCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DatasetExportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DatasetExportCountAggregateInputType | true
    }

  export interface DatasetExportDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DatasetExport'], meta: { name: 'DatasetExport' } }
    /**
     * Find zero or one DatasetExport that matches the filter.
     * @param {DatasetExportFindUniqueArgs} args - Arguments to find a DatasetExport
     * @example
     * // Get one DatasetExport
     * const datasetExport = await prisma.datasetExport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DatasetExportFindUniqueArgs>(args: SelectSubset<T, DatasetExportFindUniqueArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DatasetExport that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DatasetExportFindUniqueOrThrowArgs} args - Arguments to find a DatasetExport
     * @example
     * // Get one DatasetExport
     * const datasetExport = await prisma.datasetExport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DatasetExportFindUniqueOrThrowArgs>(args: SelectSubset<T, DatasetExportFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatasetExport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetExportFindFirstArgs} args - Arguments to find a DatasetExport
     * @example
     * // Get one DatasetExport
     * const datasetExport = await prisma.datasetExport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DatasetExportFindFirstArgs>(args?: SelectSubset<T, DatasetExportFindFirstArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DatasetExport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetExportFindFirstOrThrowArgs} args - Arguments to find a DatasetExport
     * @example
     * // Get one DatasetExport
     * const datasetExport = await prisma.datasetExport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DatasetExportFindFirstOrThrowArgs>(args?: SelectSubset<T, DatasetExportFindFirstOrThrowArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DatasetExports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetExportFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DatasetExports
     * const datasetExports = await prisma.datasetExport.findMany()
     * 
     * // Get first 10 DatasetExports
     * const datasetExports = await prisma.datasetExport.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const datasetExportWithIdOnly = await prisma.datasetExport.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DatasetExportFindManyArgs>(args?: SelectSubset<T, DatasetExportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DatasetExport.
     * @param {DatasetExportCreateArgs} args - Arguments to create a DatasetExport.
     * @example
     * // Create one DatasetExport
     * const DatasetExport = await prisma.datasetExport.create({
     *   data: {
     *     // ... data to create a DatasetExport
     *   }
     * })
     * 
     */
    create<T extends DatasetExportCreateArgs>(args: SelectSubset<T, DatasetExportCreateArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DatasetExports.
     * @param {DatasetExportCreateManyArgs} args - Arguments to create many DatasetExports.
     * @example
     * // Create many DatasetExports
     * const datasetExport = await prisma.datasetExport.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DatasetExportCreateManyArgs>(args?: SelectSubset<T, DatasetExportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DatasetExports and returns the data saved in the database.
     * @param {DatasetExportCreateManyAndReturnArgs} args - Arguments to create many DatasetExports.
     * @example
     * // Create many DatasetExports
     * const datasetExport = await prisma.datasetExport.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DatasetExports and only return the `id`
     * const datasetExportWithIdOnly = await prisma.datasetExport.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DatasetExportCreateManyAndReturnArgs>(args?: SelectSubset<T, DatasetExportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DatasetExport.
     * @param {DatasetExportDeleteArgs} args - Arguments to delete one DatasetExport.
     * @example
     * // Delete one DatasetExport
     * const DatasetExport = await prisma.datasetExport.delete({
     *   where: {
     *     // ... filter to delete one DatasetExport
     *   }
     * })
     * 
     */
    delete<T extends DatasetExportDeleteArgs>(args: SelectSubset<T, DatasetExportDeleteArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DatasetExport.
     * @param {DatasetExportUpdateArgs} args - Arguments to update one DatasetExport.
     * @example
     * // Update one DatasetExport
     * const datasetExport = await prisma.datasetExport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DatasetExportUpdateArgs>(args: SelectSubset<T, DatasetExportUpdateArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DatasetExports.
     * @param {DatasetExportDeleteManyArgs} args - Arguments to filter DatasetExports to delete.
     * @example
     * // Delete a few DatasetExports
     * const { count } = await prisma.datasetExport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DatasetExportDeleteManyArgs>(args?: SelectSubset<T, DatasetExportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatasetExports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetExportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DatasetExports
     * const datasetExport = await prisma.datasetExport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DatasetExportUpdateManyArgs>(args: SelectSubset<T, DatasetExportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DatasetExports and returns the data updated in the database.
     * @param {DatasetExportUpdateManyAndReturnArgs} args - Arguments to update many DatasetExports.
     * @example
     * // Update many DatasetExports
     * const datasetExport = await prisma.datasetExport.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DatasetExports and only return the `id`
     * const datasetExportWithIdOnly = await prisma.datasetExport.updateManyAndReturn({
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
    updateManyAndReturn<T extends DatasetExportUpdateManyAndReturnArgs>(args: SelectSubset<T, DatasetExportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DatasetExport.
     * @param {DatasetExportUpsertArgs} args - Arguments to update or create a DatasetExport.
     * @example
     * // Update or create a DatasetExport
     * const datasetExport = await prisma.datasetExport.upsert({
     *   create: {
     *     // ... data to create a DatasetExport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DatasetExport we want to update
     *   }
     * })
     */
    upsert<T extends DatasetExportUpsertArgs>(args: SelectSubset<T, DatasetExportUpsertArgs<ExtArgs>>): Prisma__DatasetExportClient<$Result.GetResult<Prisma.$DatasetExportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DatasetExports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetExportCountArgs} args - Arguments to filter DatasetExports to count.
     * @example
     * // Count the number of DatasetExports
     * const count = await prisma.datasetExport.count({
     *   where: {
     *     // ... the filter for the DatasetExports we want to count
     *   }
     * })
    **/
    count<T extends DatasetExportCountArgs>(
      args?: Subset<T, DatasetExportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DatasetExportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DatasetExport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetExportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DatasetExportAggregateArgs>(args: Subset<T, DatasetExportAggregateArgs>): Prisma.PrismaPromise<GetDatasetExportAggregateType<T>>

    /**
     * Group by DatasetExport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DatasetExportGroupByArgs} args - Group by arguments.
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
      T extends DatasetExportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DatasetExportGroupByArgs['orderBy'] }
        : { orderBy?: DatasetExportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DatasetExportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDatasetExportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DatasetExport model
   */
  readonly fields: DatasetExportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DatasetExport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DatasetExportClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DatasetExport model
   */
  interface DatasetExportFieldRefs {
    readonly id: FieldRef<"DatasetExport", 'String'>
    readonly datasetS3: FieldRef<"DatasetExport", 'String'>
    readonly rows: FieldRef<"DatasetExport", 'Int'>
    readonly metaJson: FieldRef<"DatasetExport", 'Json'>
    readonly tenantId: FieldRef<"DatasetExport", 'String'>
    readonly status: FieldRef<"DatasetExport", 'String'>
    readonly createdAt: FieldRef<"DatasetExport", 'DateTime'>
    readonly updatedAt: FieldRef<"DatasetExport", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DatasetExport findUnique
   */
  export type DatasetExportFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * Filter, which DatasetExport to fetch.
     */
    where: DatasetExportWhereUniqueInput
  }

  /**
   * DatasetExport findUniqueOrThrow
   */
  export type DatasetExportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * Filter, which DatasetExport to fetch.
     */
    where: DatasetExportWhereUniqueInput
  }

  /**
   * DatasetExport findFirst
   */
  export type DatasetExportFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * Filter, which DatasetExport to fetch.
     */
    where?: DatasetExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetExports to fetch.
     */
    orderBy?: DatasetExportOrderByWithRelationInput | DatasetExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatasetExports.
     */
    cursor?: DatasetExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetExports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetExports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatasetExports.
     */
    distinct?: DatasetExportScalarFieldEnum | DatasetExportScalarFieldEnum[]
  }

  /**
   * DatasetExport findFirstOrThrow
   */
  export type DatasetExportFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * Filter, which DatasetExport to fetch.
     */
    where?: DatasetExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetExports to fetch.
     */
    orderBy?: DatasetExportOrderByWithRelationInput | DatasetExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DatasetExports.
     */
    cursor?: DatasetExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetExports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetExports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DatasetExports.
     */
    distinct?: DatasetExportScalarFieldEnum | DatasetExportScalarFieldEnum[]
  }

  /**
   * DatasetExport findMany
   */
  export type DatasetExportFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * Filter, which DatasetExports to fetch.
     */
    where?: DatasetExportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DatasetExports to fetch.
     */
    orderBy?: DatasetExportOrderByWithRelationInput | DatasetExportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DatasetExports.
     */
    cursor?: DatasetExportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DatasetExports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DatasetExports.
     */
    skip?: number
    distinct?: DatasetExportScalarFieldEnum | DatasetExportScalarFieldEnum[]
  }

  /**
   * DatasetExport create
   */
  export type DatasetExportCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * The data needed to create a DatasetExport.
     */
    data: XOR<DatasetExportCreateInput, DatasetExportUncheckedCreateInput>
  }

  /**
   * DatasetExport createMany
   */
  export type DatasetExportCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DatasetExports.
     */
    data: DatasetExportCreateManyInput | DatasetExportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatasetExport createManyAndReturn
   */
  export type DatasetExportCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * The data used to create many DatasetExports.
     */
    data: DatasetExportCreateManyInput | DatasetExportCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DatasetExport update
   */
  export type DatasetExportUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * The data needed to update a DatasetExport.
     */
    data: XOR<DatasetExportUpdateInput, DatasetExportUncheckedUpdateInput>
    /**
     * Choose, which DatasetExport to update.
     */
    where: DatasetExportWhereUniqueInput
  }

  /**
   * DatasetExport updateMany
   */
  export type DatasetExportUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DatasetExports.
     */
    data: XOR<DatasetExportUpdateManyMutationInput, DatasetExportUncheckedUpdateManyInput>
    /**
     * Filter which DatasetExports to update
     */
    where?: DatasetExportWhereInput
    /**
     * Limit how many DatasetExports to update.
     */
    limit?: number
  }

  /**
   * DatasetExport updateManyAndReturn
   */
  export type DatasetExportUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * The data used to update DatasetExports.
     */
    data: XOR<DatasetExportUpdateManyMutationInput, DatasetExportUncheckedUpdateManyInput>
    /**
     * Filter which DatasetExports to update
     */
    where?: DatasetExportWhereInput
    /**
     * Limit how many DatasetExports to update.
     */
    limit?: number
  }

  /**
   * DatasetExport upsert
   */
  export type DatasetExportUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * The filter to search for the DatasetExport to update in case it exists.
     */
    where: DatasetExportWhereUniqueInput
    /**
     * In case the DatasetExport found by the `where` argument doesn't exist, create a new DatasetExport with this data.
     */
    create: XOR<DatasetExportCreateInput, DatasetExportUncheckedCreateInput>
    /**
     * In case the DatasetExport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DatasetExportUpdateInput, DatasetExportUncheckedUpdateInput>
  }

  /**
   * DatasetExport delete
   */
  export type DatasetExportDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
    /**
     * Filter which DatasetExport to delete.
     */
    where: DatasetExportWhereUniqueInput
  }

  /**
   * DatasetExport deleteMany
   */
  export type DatasetExportDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DatasetExports to delete
     */
    where?: DatasetExportWhereInput
    /**
     * Limit how many DatasetExports to delete.
     */
    limit?: number
  }

  /**
   * DatasetExport without action
   */
  export type DatasetExportDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DatasetExport
     */
    select?: DatasetExportSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DatasetExport
     */
    omit?: DatasetExportOmit<ExtArgs> | null
  }


  /**
   * Model ModelRegistry
   */

  export type AggregateModelRegistry = {
    _count: ModelRegistryCountAggregateOutputType | null
    _min: ModelRegistryMinAggregateOutputType | null
    _max: ModelRegistryMaxAggregateOutputType | null
  }

  export type ModelRegistryMinAggregateOutputType = {
    id: string | null
    modelId: string | null
    tenantId: string | null
    name: string | null
    version: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModelRegistryMaxAggregateOutputType = {
    id: string | null
    modelId: string | null
    tenantId: string | null
    name: string | null
    version: string | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ModelRegistryCountAggregateOutputType = {
    id: number
    modelId: number
    tenantId: number
    name: number
    version: number
    status: number
    config: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ModelRegistryMinAggregateInputType = {
    id?: true
    modelId?: true
    tenantId?: true
    name?: true
    version?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModelRegistryMaxAggregateInputType = {
    id?: true
    modelId?: true
    tenantId?: true
    name?: true
    version?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ModelRegistryCountAggregateInputType = {
    id?: true
    modelId?: true
    tenantId?: true
    name?: true
    version?: true
    status?: true
    config?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ModelRegistryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModelRegistry to aggregate.
     */
    where?: ModelRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModelRegistries to fetch.
     */
    orderBy?: ModelRegistryOrderByWithRelationInput | ModelRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ModelRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModelRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModelRegistries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ModelRegistries
    **/
    _count?: true | ModelRegistryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ModelRegistryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ModelRegistryMaxAggregateInputType
  }

  export type GetModelRegistryAggregateType<T extends ModelRegistryAggregateArgs> = {
        [P in keyof T & keyof AggregateModelRegistry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateModelRegistry[P]>
      : GetScalarType<T[P], AggregateModelRegistry[P]>
  }




  export type ModelRegistryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ModelRegistryWhereInput
    orderBy?: ModelRegistryOrderByWithAggregationInput | ModelRegistryOrderByWithAggregationInput[]
    by: ModelRegistryScalarFieldEnum[] | ModelRegistryScalarFieldEnum
    having?: ModelRegistryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ModelRegistryCountAggregateInputType | true
    _min?: ModelRegistryMinAggregateInputType
    _max?: ModelRegistryMaxAggregateInputType
  }

  export type ModelRegistryGroupByOutputType = {
    id: string
    modelId: string
    tenantId: string
    name: string
    version: string
    status: string
    config: JsonValue | null
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: ModelRegistryCountAggregateOutputType | null
    _min: ModelRegistryMinAggregateOutputType | null
    _max: ModelRegistryMaxAggregateOutputType | null
  }

  type GetModelRegistryGroupByPayload<T extends ModelRegistryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ModelRegistryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ModelRegistryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ModelRegistryGroupByOutputType[P]>
            : GetScalarType<T[P], ModelRegistryGroupByOutputType[P]>
        }
      >
    >


  export type ModelRegistrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    modelId?: boolean
    tenantId?: boolean
    name?: boolean
    version?: boolean
    status?: boolean
    config?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["modelRegistry"]>

  export type ModelRegistrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    modelId?: boolean
    tenantId?: boolean
    name?: boolean
    version?: boolean
    status?: boolean
    config?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["modelRegistry"]>

  export type ModelRegistrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    modelId?: boolean
    tenantId?: boolean
    name?: boolean
    version?: boolean
    status?: boolean
    config?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["modelRegistry"]>

  export type ModelRegistrySelectScalar = {
    id?: boolean
    modelId?: boolean
    tenantId?: boolean
    name?: boolean
    version?: boolean
    status?: boolean
    config?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ModelRegistryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "modelId" | "tenantId" | "name" | "version" | "status" | "config" | "metadata" | "createdAt" | "updatedAt", ExtArgs["result"]["modelRegistry"]>

  export type $ModelRegistryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ModelRegistry"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      modelId: string
      tenantId: string
      name: string
      version: string
      status: string
      config: Prisma.JsonValue | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["modelRegistry"]>
    composites: {}
  }

  type ModelRegistryGetPayload<S extends boolean | null | undefined | ModelRegistryDefaultArgs> = $Result.GetResult<Prisma.$ModelRegistryPayload, S>

  type ModelRegistryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ModelRegistryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ModelRegistryCountAggregateInputType | true
    }

  export interface ModelRegistryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ModelRegistry'], meta: { name: 'ModelRegistry' } }
    /**
     * Find zero or one ModelRegistry that matches the filter.
     * @param {ModelRegistryFindUniqueArgs} args - Arguments to find a ModelRegistry
     * @example
     * // Get one ModelRegistry
     * const modelRegistry = await prisma.modelRegistry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ModelRegistryFindUniqueArgs>(args: SelectSubset<T, ModelRegistryFindUniqueArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ModelRegistry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ModelRegistryFindUniqueOrThrowArgs} args - Arguments to find a ModelRegistry
     * @example
     * // Get one ModelRegistry
     * const modelRegistry = await prisma.modelRegistry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ModelRegistryFindUniqueOrThrowArgs>(args: SelectSubset<T, ModelRegistryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ModelRegistry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelRegistryFindFirstArgs} args - Arguments to find a ModelRegistry
     * @example
     * // Get one ModelRegistry
     * const modelRegistry = await prisma.modelRegistry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ModelRegistryFindFirstArgs>(args?: SelectSubset<T, ModelRegistryFindFirstArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ModelRegistry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelRegistryFindFirstOrThrowArgs} args - Arguments to find a ModelRegistry
     * @example
     * // Get one ModelRegistry
     * const modelRegistry = await prisma.modelRegistry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ModelRegistryFindFirstOrThrowArgs>(args?: SelectSubset<T, ModelRegistryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ModelRegistries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelRegistryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ModelRegistries
     * const modelRegistries = await prisma.modelRegistry.findMany()
     * 
     * // Get first 10 ModelRegistries
     * const modelRegistries = await prisma.modelRegistry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const modelRegistryWithIdOnly = await prisma.modelRegistry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ModelRegistryFindManyArgs>(args?: SelectSubset<T, ModelRegistryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ModelRegistry.
     * @param {ModelRegistryCreateArgs} args - Arguments to create a ModelRegistry.
     * @example
     * // Create one ModelRegistry
     * const ModelRegistry = await prisma.modelRegistry.create({
     *   data: {
     *     // ... data to create a ModelRegistry
     *   }
     * })
     * 
     */
    create<T extends ModelRegistryCreateArgs>(args: SelectSubset<T, ModelRegistryCreateArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ModelRegistries.
     * @param {ModelRegistryCreateManyArgs} args - Arguments to create many ModelRegistries.
     * @example
     * // Create many ModelRegistries
     * const modelRegistry = await prisma.modelRegistry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ModelRegistryCreateManyArgs>(args?: SelectSubset<T, ModelRegistryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ModelRegistries and returns the data saved in the database.
     * @param {ModelRegistryCreateManyAndReturnArgs} args - Arguments to create many ModelRegistries.
     * @example
     * // Create many ModelRegistries
     * const modelRegistry = await prisma.modelRegistry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ModelRegistries and only return the `id`
     * const modelRegistryWithIdOnly = await prisma.modelRegistry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ModelRegistryCreateManyAndReturnArgs>(args?: SelectSubset<T, ModelRegistryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ModelRegistry.
     * @param {ModelRegistryDeleteArgs} args - Arguments to delete one ModelRegistry.
     * @example
     * // Delete one ModelRegistry
     * const ModelRegistry = await prisma.modelRegistry.delete({
     *   where: {
     *     // ... filter to delete one ModelRegistry
     *   }
     * })
     * 
     */
    delete<T extends ModelRegistryDeleteArgs>(args: SelectSubset<T, ModelRegistryDeleteArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ModelRegistry.
     * @param {ModelRegistryUpdateArgs} args - Arguments to update one ModelRegistry.
     * @example
     * // Update one ModelRegistry
     * const modelRegistry = await prisma.modelRegistry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ModelRegistryUpdateArgs>(args: SelectSubset<T, ModelRegistryUpdateArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ModelRegistries.
     * @param {ModelRegistryDeleteManyArgs} args - Arguments to filter ModelRegistries to delete.
     * @example
     * // Delete a few ModelRegistries
     * const { count } = await prisma.modelRegistry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ModelRegistryDeleteManyArgs>(args?: SelectSubset<T, ModelRegistryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ModelRegistries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelRegistryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ModelRegistries
     * const modelRegistry = await prisma.modelRegistry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ModelRegistryUpdateManyArgs>(args: SelectSubset<T, ModelRegistryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ModelRegistries and returns the data updated in the database.
     * @param {ModelRegistryUpdateManyAndReturnArgs} args - Arguments to update many ModelRegistries.
     * @example
     * // Update many ModelRegistries
     * const modelRegistry = await prisma.modelRegistry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ModelRegistries and only return the `id`
     * const modelRegistryWithIdOnly = await prisma.modelRegistry.updateManyAndReturn({
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
    updateManyAndReturn<T extends ModelRegistryUpdateManyAndReturnArgs>(args: SelectSubset<T, ModelRegistryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ModelRegistry.
     * @param {ModelRegistryUpsertArgs} args - Arguments to update or create a ModelRegistry.
     * @example
     * // Update or create a ModelRegistry
     * const modelRegistry = await prisma.modelRegistry.upsert({
     *   create: {
     *     // ... data to create a ModelRegistry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ModelRegistry we want to update
     *   }
     * })
     */
    upsert<T extends ModelRegistryUpsertArgs>(args: SelectSubset<T, ModelRegistryUpsertArgs<ExtArgs>>): Prisma__ModelRegistryClient<$Result.GetResult<Prisma.$ModelRegistryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ModelRegistries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelRegistryCountArgs} args - Arguments to filter ModelRegistries to count.
     * @example
     * // Count the number of ModelRegistries
     * const count = await prisma.modelRegistry.count({
     *   where: {
     *     // ... the filter for the ModelRegistries we want to count
     *   }
     * })
    **/
    count<T extends ModelRegistryCountArgs>(
      args?: Subset<T, ModelRegistryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ModelRegistryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ModelRegistry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelRegistryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ModelRegistryAggregateArgs>(args: Subset<T, ModelRegistryAggregateArgs>): Prisma.PrismaPromise<GetModelRegistryAggregateType<T>>

    /**
     * Group by ModelRegistry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ModelRegistryGroupByArgs} args - Group by arguments.
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
      T extends ModelRegistryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ModelRegistryGroupByArgs['orderBy'] }
        : { orderBy?: ModelRegistryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ModelRegistryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetModelRegistryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ModelRegistry model
   */
  readonly fields: ModelRegistryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ModelRegistry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ModelRegistryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ModelRegistry model
   */
  interface ModelRegistryFieldRefs {
    readonly id: FieldRef<"ModelRegistry", 'String'>
    readonly modelId: FieldRef<"ModelRegistry", 'String'>
    readonly tenantId: FieldRef<"ModelRegistry", 'String'>
    readonly name: FieldRef<"ModelRegistry", 'String'>
    readonly version: FieldRef<"ModelRegistry", 'String'>
    readonly status: FieldRef<"ModelRegistry", 'String'>
    readonly config: FieldRef<"ModelRegistry", 'Json'>
    readonly metadata: FieldRef<"ModelRegistry", 'Json'>
    readonly createdAt: FieldRef<"ModelRegistry", 'DateTime'>
    readonly updatedAt: FieldRef<"ModelRegistry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ModelRegistry findUnique
   */
  export type ModelRegistryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModelRegistry to fetch.
     */
    where: ModelRegistryWhereUniqueInput
  }

  /**
   * ModelRegistry findUniqueOrThrow
   */
  export type ModelRegistryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModelRegistry to fetch.
     */
    where: ModelRegistryWhereUniqueInput
  }

  /**
   * ModelRegistry findFirst
   */
  export type ModelRegistryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModelRegistry to fetch.
     */
    where?: ModelRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModelRegistries to fetch.
     */
    orderBy?: ModelRegistryOrderByWithRelationInput | ModelRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModelRegistries.
     */
    cursor?: ModelRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModelRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModelRegistries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModelRegistries.
     */
    distinct?: ModelRegistryScalarFieldEnum | ModelRegistryScalarFieldEnum[]
  }

  /**
   * ModelRegistry findFirstOrThrow
   */
  export type ModelRegistryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModelRegistry to fetch.
     */
    where?: ModelRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModelRegistries to fetch.
     */
    orderBy?: ModelRegistryOrderByWithRelationInput | ModelRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ModelRegistries.
     */
    cursor?: ModelRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModelRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModelRegistries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ModelRegistries.
     */
    distinct?: ModelRegistryScalarFieldEnum | ModelRegistryScalarFieldEnum[]
  }

  /**
   * ModelRegistry findMany
   */
  export type ModelRegistryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * Filter, which ModelRegistries to fetch.
     */
    where?: ModelRegistryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ModelRegistries to fetch.
     */
    orderBy?: ModelRegistryOrderByWithRelationInput | ModelRegistryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ModelRegistries.
     */
    cursor?: ModelRegistryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ModelRegistries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ModelRegistries.
     */
    skip?: number
    distinct?: ModelRegistryScalarFieldEnum | ModelRegistryScalarFieldEnum[]
  }

  /**
   * ModelRegistry create
   */
  export type ModelRegistryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * The data needed to create a ModelRegistry.
     */
    data: XOR<ModelRegistryCreateInput, ModelRegistryUncheckedCreateInput>
  }

  /**
   * ModelRegistry createMany
   */
  export type ModelRegistryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ModelRegistries.
     */
    data: ModelRegistryCreateManyInput | ModelRegistryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ModelRegistry createManyAndReturn
   */
  export type ModelRegistryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * The data used to create many ModelRegistries.
     */
    data: ModelRegistryCreateManyInput | ModelRegistryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ModelRegistry update
   */
  export type ModelRegistryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * The data needed to update a ModelRegistry.
     */
    data: XOR<ModelRegistryUpdateInput, ModelRegistryUncheckedUpdateInput>
    /**
     * Choose, which ModelRegistry to update.
     */
    where: ModelRegistryWhereUniqueInput
  }

  /**
   * ModelRegistry updateMany
   */
  export type ModelRegistryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ModelRegistries.
     */
    data: XOR<ModelRegistryUpdateManyMutationInput, ModelRegistryUncheckedUpdateManyInput>
    /**
     * Filter which ModelRegistries to update
     */
    where?: ModelRegistryWhereInput
    /**
     * Limit how many ModelRegistries to update.
     */
    limit?: number
  }

  /**
   * ModelRegistry updateManyAndReturn
   */
  export type ModelRegistryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * The data used to update ModelRegistries.
     */
    data: XOR<ModelRegistryUpdateManyMutationInput, ModelRegistryUncheckedUpdateManyInput>
    /**
     * Filter which ModelRegistries to update
     */
    where?: ModelRegistryWhereInput
    /**
     * Limit how many ModelRegistries to update.
     */
    limit?: number
  }

  /**
   * ModelRegistry upsert
   */
  export type ModelRegistryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * The filter to search for the ModelRegistry to update in case it exists.
     */
    where: ModelRegistryWhereUniqueInput
    /**
     * In case the ModelRegistry found by the `where` argument doesn't exist, create a new ModelRegistry with this data.
     */
    create: XOR<ModelRegistryCreateInput, ModelRegistryUncheckedCreateInput>
    /**
     * In case the ModelRegistry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ModelRegistryUpdateInput, ModelRegistryUncheckedUpdateInput>
  }

  /**
   * ModelRegistry delete
   */
  export type ModelRegistryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
    /**
     * Filter which ModelRegistry to delete.
     */
    where: ModelRegistryWhereUniqueInput
  }

  /**
   * ModelRegistry deleteMany
   */
  export type ModelRegistryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ModelRegistries to delete
     */
    where?: ModelRegistryWhereInput
    /**
     * Limit how many ModelRegistries to delete.
     */
    limit?: number
  }

  /**
   * ModelRegistry without action
   */
  export type ModelRegistryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ModelRegistry
     */
    select?: ModelRegistrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ModelRegistry
     */
    omit?: ModelRegistryOmit<ExtArgs> | null
  }


  /**
   * Model WeightMapping
   */

  export type AggregateWeightMapping = {
    _count: WeightMappingCountAggregateOutputType | null
    _avg: WeightMappingAvgAggregateOutputType | null
    _sum: WeightMappingSumAggregateOutputType | null
    _min: WeightMappingMinAggregateOutputType | null
    _max: WeightMappingMaxAggregateOutputType | null
  }

  export type WeightMappingAvgAggregateOutputType = {
    weightKg: number | null
  }

  export type WeightMappingSumAggregateOutputType = {
    weightKg: number | null
  }

  export type WeightMappingMinAggregateOutputType = {
    id: string | null
    mediaId: string | null
    weightKg: number | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeightMappingMaxAggregateOutputType = {
    id: string | null
    mediaId: string | null
    weightKg: number | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeightMappingCountAggregateOutputType = {
    id: number
    mediaId: number
    weightKg: number
    tenantId: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WeightMappingAvgAggregateInputType = {
    weightKg?: true
  }

  export type WeightMappingSumAggregateInputType = {
    weightKg?: true
  }

  export type WeightMappingMinAggregateInputType = {
    id?: true
    mediaId?: true
    weightKg?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeightMappingMaxAggregateInputType = {
    id?: true
    mediaId?: true
    weightKg?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeightMappingCountAggregateInputType = {
    id?: true
    mediaId?: true
    weightKg?: true
    tenantId?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WeightMappingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightMapping to aggregate.
     */
    where?: WeightMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightMappings to fetch.
     */
    orderBy?: WeightMappingOrderByWithRelationInput | WeightMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeightMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WeightMappings
    **/
    _count?: true | WeightMappingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeightMappingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeightMappingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeightMappingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeightMappingMaxAggregateInputType
  }

  export type GetWeightMappingAggregateType<T extends WeightMappingAggregateArgs> = {
        [P in keyof T & keyof AggregateWeightMapping]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeightMapping[P]>
      : GetScalarType<T[P], AggregateWeightMapping[P]>
  }




  export type WeightMappingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeightMappingWhereInput
    orderBy?: WeightMappingOrderByWithAggregationInput | WeightMappingOrderByWithAggregationInput[]
    by: WeightMappingScalarFieldEnum[] | WeightMappingScalarFieldEnum
    having?: WeightMappingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeightMappingCountAggregateInputType | true
    _avg?: WeightMappingAvgAggregateInputType
    _sum?: WeightMappingSumAggregateInputType
    _min?: WeightMappingMinAggregateInputType
    _max?: WeightMappingMaxAggregateInputType
  }

  export type WeightMappingGroupByOutputType = {
    id: string
    mediaId: string
    weightKg: number
    tenantId: string | null
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: WeightMappingCountAggregateOutputType | null
    _avg: WeightMappingAvgAggregateOutputType | null
    _sum: WeightMappingSumAggregateOutputType | null
    _min: WeightMappingMinAggregateOutputType | null
    _max: WeightMappingMaxAggregateOutputType | null
  }

  type GetWeightMappingGroupByPayload<T extends WeightMappingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeightMappingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeightMappingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeightMappingGroupByOutputType[P]>
            : GetScalarType<T[P], WeightMappingGroupByOutputType[P]>
        }
      >
    >


  export type WeightMappingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaId?: boolean
    weightKg?: boolean
    tenantId?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightMapping"]>

  export type WeightMappingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaId?: boolean
    weightKg?: boolean
    tenantId?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightMapping"]>

  export type WeightMappingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mediaId?: boolean
    weightKg?: boolean
    tenantId?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weightMapping"]>

  export type WeightMappingSelectScalar = {
    id?: boolean
    mediaId?: boolean
    weightKg?: boolean
    tenantId?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WeightMappingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "mediaId" | "weightKg" | "tenantId" | "metadata" | "createdAt" | "updatedAt", ExtArgs["result"]["weightMapping"]>

  export type $WeightMappingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WeightMapping"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      mediaId: string
      weightKg: number
      tenantId: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["weightMapping"]>
    composites: {}
  }

  type WeightMappingGetPayload<S extends boolean | null | undefined | WeightMappingDefaultArgs> = $Result.GetResult<Prisma.$WeightMappingPayload, S>

  type WeightMappingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeightMappingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WeightMappingCountAggregateInputType | true
    }

  export interface WeightMappingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WeightMapping'], meta: { name: 'WeightMapping' } }
    /**
     * Find zero or one WeightMapping that matches the filter.
     * @param {WeightMappingFindUniqueArgs} args - Arguments to find a WeightMapping
     * @example
     * // Get one WeightMapping
     * const weightMapping = await prisma.weightMapping.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeightMappingFindUniqueArgs>(args: SelectSubset<T, WeightMappingFindUniqueArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WeightMapping that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeightMappingFindUniqueOrThrowArgs} args - Arguments to find a WeightMapping
     * @example
     * // Get one WeightMapping
     * const weightMapping = await prisma.weightMapping.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeightMappingFindUniqueOrThrowArgs>(args: SelectSubset<T, WeightMappingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightMapping that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightMappingFindFirstArgs} args - Arguments to find a WeightMapping
     * @example
     * // Get one WeightMapping
     * const weightMapping = await prisma.weightMapping.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeightMappingFindFirstArgs>(args?: SelectSubset<T, WeightMappingFindFirstArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeightMapping that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightMappingFindFirstOrThrowArgs} args - Arguments to find a WeightMapping
     * @example
     * // Get one WeightMapping
     * const weightMapping = await prisma.weightMapping.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeightMappingFindFirstOrThrowArgs>(args?: SelectSubset<T, WeightMappingFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WeightMappings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightMappingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeightMappings
     * const weightMappings = await prisma.weightMapping.findMany()
     * 
     * // Get first 10 WeightMappings
     * const weightMappings = await prisma.weightMapping.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weightMappingWithIdOnly = await prisma.weightMapping.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeightMappingFindManyArgs>(args?: SelectSubset<T, WeightMappingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WeightMapping.
     * @param {WeightMappingCreateArgs} args - Arguments to create a WeightMapping.
     * @example
     * // Create one WeightMapping
     * const WeightMapping = await prisma.weightMapping.create({
     *   data: {
     *     // ... data to create a WeightMapping
     *   }
     * })
     * 
     */
    create<T extends WeightMappingCreateArgs>(args: SelectSubset<T, WeightMappingCreateArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WeightMappings.
     * @param {WeightMappingCreateManyArgs} args - Arguments to create many WeightMappings.
     * @example
     * // Create many WeightMappings
     * const weightMapping = await prisma.weightMapping.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeightMappingCreateManyArgs>(args?: SelectSubset<T, WeightMappingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WeightMappings and returns the data saved in the database.
     * @param {WeightMappingCreateManyAndReturnArgs} args - Arguments to create many WeightMappings.
     * @example
     * // Create many WeightMappings
     * const weightMapping = await prisma.weightMapping.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WeightMappings and only return the `id`
     * const weightMappingWithIdOnly = await prisma.weightMapping.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WeightMappingCreateManyAndReturnArgs>(args?: SelectSubset<T, WeightMappingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WeightMapping.
     * @param {WeightMappingDeleteArgs} args - Arguments to delete one WeightMapping.
     * @example
     * // Delete one WeightMapping
     * const WeightMapping = await prisma.weightMapping.delete({
     *   where: {
     *     // ... filter to delete one WeightMapping
     *   }
     * })
     * 
     */
    delete<T extends WeightMappingDeleteArgs>(args: SelectSubset<T, WeightMappingDeleteArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WeightMapping.
     * @param {WeightMappingUpdateArgs} args - Arguments to update one WeightMapping.
     * @example
     * // Update one WeightMapping
     * const weightMapping = await prisma.weightMapping.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeightMappingUpdateArgs>(args: SelectSubset<T, WeightMappingUpdateArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WeightMappings.
     * @param {WeightMappingDeleteManyArgs} args - Arguments to filter WeightMappings to delete.
     * @example
     * // Delete a few WeightMappings
     * const { count } = await prisma.weightMapping.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeightMappingDeleteManyArgs>(args?: SelectSubset<T, WeightMappingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightMappingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeightMappings
     * const weightMapping = await prisma.weightMapping.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeightMappingUpdateManyArgs>(args: SelectSubset<T, WeightMappingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeightMappings and returns the data updated in the database.
     * @param {WeightMappingUpdateManyAndReturnArgs} args - Arguments to update many WeightMappings.
     * @example
     * // Update many WeightMappings
     * const weightMapping = await prisma.weightMapping.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WeightMappings and only return the `id`
     * const weightMappingWithIdOnly = await prisma.weightMapping.updateManyAndReturn({
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
    updateManyAndReturn<T extends WeightMappingUpdateManyAndReturnArgs>(args: SelectSubset<T, WeightMappingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WeightMapping.
     * @param {WeightMappingUpsertArgs} args - Arguments to update or create a WeightMapping.
     * @example
     * // Update or create a WeightMapping
     * const weightMapping = await prisma.weightMapping.upsert({
     *   create: {
     *     // ... data to create a WeightMapping
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeightMapping we want to update
     *   }
     * })
     */
    upsert<T extends WeightMappingUpsertArgs>(args: SelectSubset<T, WeightMappingUpsertArgs<ExtArgs>>): Prisma__WeightMappingClient<$Result.GetResult<Prisma.$WeightMappingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WeightMappings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightMappingCountArgs} args - Arguments to filter WeightMappings to count.
     * @example
     * // Count the number of WeightMappings
     * const count = await prisma.weightMapping.count({
     *   where: {
     *     // ... the filter for the WeightMappings we want to count
     *   }
     * })
    **/
    count<T extends WeightMappingCountArgs>(
      args?: Subset<T, WeightMappingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeightMappingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WeightMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightMappingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WeightMappingAggregateArgs>(args: Subset<T, WeightMappingAggregateArgs>): Prisma.PrismaPromise<GetWeightMappingAggregateType<T>>

    /**
     * Group by WeightMapping.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeightMappingGroupByArgs} args - Group by arguments.
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
      T extends WeightMappingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeightMappingGroupByArgs['orderBy'] }
        : { orderBy?: WeightMappingGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WeightMappingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeightMappingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WeightMapping model
   */
  readonly fields: WeightMappingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeightMapping.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeightMappingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WeightMapping model
   */
  interface WeightMappingFieldRefs {
    readonly id: FieldRef<"WeightMapping", 'String'>
    readonly mediaId: FieldRef<"WeightMapping", 'String'>
    readonly weightKg: FieldRef<"WeightMapping", 'Float'>
    readonly tenantId: FieldRef<"WeightMapping", 'String'>
    readonly metadata: FieldRef<"WeightMapping", 'Json'>
    readonly createdAt: FieldRef<"WeightMapping", 'DateTime'>
    readonly updatedAt: FieldRef<"WeightMapping", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WeightMapping findUnique
   */
  export type WeightMappingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * Filter, which WeightMapping to fetch.
     */
    where: WeightMappingWhereUniqueInput
  }

  /**
   * WeightMapping findUniqueOrThrow
   */
  export type WeightMappingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * Filter, which WeightMapping to fetch.
     */
    where: WeightMappingWhereUniqueInput
  }

  /**
   * WeightMapping findFirst
   */
  export type WeightMappingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * Filter, which WeightMapping to fetch.
     */
    where?: WeightMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightMappings to fetch.
     */
    orderBy?: WeightMappingOrderByWithRelationInput | WeightMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightMappings.
     */
    cursor?: WeightMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightMappings.
     */
    distinct?: WeightMappingScalarFieldEnum | WeightMappingScalarFieldEnum[]
  }

  /**
   * WeightMapping findFirstOrThrow
   */
  export type WeightMappingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * Filter, which WeightMapping to fetch.
     */
    where?: WeightMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightMappings to fetch.
     */
    orderBy?: WeightMappingOrderByWithRelationInput | WeightMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeightMappings.
     */
    cursor?: WeightMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightMappings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeightMappings.
     */
    distinct?: WeightMappingScalarFieldEnum | WeightMappingScalarFieldEnum[]
  }

  /**
   * WeightMapping findMany
   */
  export type WeightMappingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * Filter, which WeightMappings to fetch.
     */
    where?: WeightMappingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeightMappings to fetch.
     */
    orderBy?: WeightMappingOrderByWithRelationInput | WeightMappingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WeightMappings.
     */
    cursor?: WeightMappingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeightMappings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeightMappings.
     */
    skip?: number
    distinct?: WeightMappingScalarFieldEnum | WeightMappingScalarFieldEnum[]
  }

  /**
   * WeightMapping create
   */
  export type WeightMappingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * The data needed to create a WeightMapping.
     */
    data: XOR<WeightMappingCreateInput, WeightMappingUncheckedCreateInput>
  }

  /**
   * WeightMapping createMany
   */
  export type WeightMappingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeightMappings.
     */
    data: WeightMappingCreateManyInput | WeightMappingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightMapping createManyAndReturn
   */
  export type WeightMappingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * The data used to create many WeightMappings.
     */
    data: WeightMappingCreateManyInput | WeightMappingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeightMapping update
   */
  export type WeightMappingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * The data needed to update a WeightMapping.
     */
    data: XOR<WeightMappingUpdateInput, WeightMappingUncheckedUpdateInput>
    /**
     * Choose, which WeightMapping to update.
     */
    where: WeightMappingWhereUniqueInput
  }

  /**
   * WeightMapping updateMany
   */
  export type WeightMappingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WeightMappings.
     */
    data: XOR<WeightMappingUpdateManyMutationInput, WeightMappingUncheckedUpdateManyInput>
    /**
     * Filter which WeightMappings to update
     */
    where?: WeightMappingWhereInput
    /**
     * Limit how many WeightMappings to update.
     */
    limit?: number
  }

  /**
   * WeightMapping updateManyAndReturn
   */
  export type WeightMappingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * The data used to update WeightMappings.
     */
    data: XOR<WeightMappingUpdateManyMutationInput, WeightMappingUncheckedUpdateManyInput>
    /**
     * Filter which WeightMappings to update
     */
    where?: WeightMappingWhereInput
    /**
     * Limit how many WeightMappings to update.
     */
    limit?: number
  }

  /**
   * WeightMapping upsert
   */
  export type WeightMappingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * The filter to search for the WeightMapping to update in case it exists.
     */
    where: WeightMappingWhereUniqueInput
    /**
     * In case the WeightMapping found by the `where` argument doesn't exist, create a new WeightMapping with this data.
     */
    create: XOR<WeightMappingCreateInput, WeightMappingUncheckedCreateInput>
    /**
     * In case the WeightMapping was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeightMappingUpdateInput, WeightMappingUncheckedUpdateInput>
  }

  /**
   * WeightMapping delete
   */
  export type WeightMappingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
    /**
     * Filter which WeightMapping to delete.
     */
    where: WeightMappingWhereUniqueInput
  }

  /**
   * WeightMapping deleteMany
   */
  export type WeightMappingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeightMappings to delete
     */
    where?: WeightMappingWhereInput
    /**
     * Limit how many WeightMappings to delete.
     */
    limit?: number
  }

  /**
   * WeightMapping without action
   */
  export type WeightMappingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeightMapping
     */
    select?: WeightMappingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeightMapping
     */
    omit?: WeightMappingOmit<ExtArgs> | null
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


  export const DatasetExportScalarFieldEnum: {
    id: 'id',
    datasetS3: 'datasetS3',
    rows: 'rows',
    metaJson: 'metaJson',
    tenantId: 'tenantId',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DatasetExportScalarFieldEnum = (typeof DatasetExportScalarFieldEnum)[keyof typeof DatasetExportScalarFieldEnum]


  export const ModelRegistryScalarFieldEnum: {
    id: 'id',
    modelId: 'modelId',
    tenantId: 'tenantId',
    name: 'name',
    version: 'version',
    status: 'status',
    config: 'config',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ModelRegistryScalarFieldEnum = (typeof ModelRegistryScalarFieldEnum)[keyof typeof ModelRegistryScalarFieldEnum]


  export const WeightMappingScalarFieldEnum: {
    id: 'id',
    mediaId: 'mediaId',
    weightKg: 'weightKg',
    tenantId: 'tenantId',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WeightMappingScalarFieldEnum = (typeof WeightMappingScalarFieldEnum)[keyof typeof WeightMappingScalarFieldEnum]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type DatasetExportWhereInput = {
    AND?: DatasetExportWhereInput | DatasetExportWhereInput[]
    OR?: DatasetExportWhereInput[]
    NOT?: DatasetExportWhereInput | DatasetExportWhereInput[]
    id?: StringFilter<"DatasetExport"> | string
    datasetS3?: StringFilter<"DatasetExport"> | string
    rows?: IntFilter<"DatasetExport"> | number
    metaJson?: JsonNullableFilter<"DatasetExport">
    tenantId?: StringNullableFilter<"DatasetExport"> | string | null
    status?: StringFilter<"DatasetExport"> | string
    createdAt?: DateTimeFilter<"DatasetExport"> | Date | string
    updatedAt?: DateTimeFilter<"DatasetExport"> | Date | string
  }

  export type DatasetExportOrderByWithRelationInput = {
    id?: SortOrder
    datasetS3?: SortOrder
    rows?: SortOrder
    metaJson?: SortOrderInput | SortOrder
    tenantId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatasetExportWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DatasetExportWhereInput | DatasetExportWhereInput[]
    OR?: DatasetExportWhereInput[]
    NOT?: DatasetExportWhereInput | DatasetExportWhereInput[]
    datasetS3?: StringFilter<"DatasetExport"> | string
    rows?: IntFilter<"DatasetExport"> | number
    metaJson?: JsonNullableFilter<"DatasetExport">
    tenantId?: StringNullableFilter<"DatasetExport"> | string | null
    status?: StringFilter<"DatasetExport"> | string
    createdAt?: DateTimeFilter<"DatasetExport"> | Date | string
    updatedAt?: DateTimeFilter<"DatasetExport"> | Date | string
  }, "id">

  export type DatasetExportOrderByWithAggregationInput = {
    id?: SortOrder
    datasetS3?: SortOrder
    rows?: SortOrder
    metaJson?: SortOrderInput | SortOrder
    tenantId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DatasetExportCountOrderByAggregateInput
    _avg?: DatasetExportAvgOrderByAggregateInput
    _max?: DatasetExportMaxOrderByAggregateInput
    _min?: DatasetExportMinOrderByAggregateInput
    _sum?: DatasetExportSumOrderByAggregateInput
  }

  export type DatasetExportScalarWhereWithAggregatesInput = {
    AND?: DatasetExportScalarWhereWithAggregatesInput | DatasetExportScalarWhereWithAggregatesInput[]
    OR?: DatasetExportScalarWhereWithAggregatesInput[]
    NOT?: DatasetExportScalarWhereWithAggregatesInput | DatasetExportScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DatasetExport"> | string
    datasetS3?: StringWithAggregatesFilter<"DatasetExport"> | string
    rows?: IntWithAggregatesFilter<"DatasetExport"> | number
    metaJson?: JsonNullableWithAggregatesFilter<"DatasetExport">
    tenantId?: StringNullableWithAggregatesFilter<"DatasetExport"> | string | null
    status?: StringWithAggregatesFilter<"DatasetExport"> | string
    createdAt?: DateTimeWithAggregatesFilter<"DatasetExport"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DatasetExport"> | Date | string
  }

  export type ModelRegistryWhereInput = {
    AND?: ModelRegistryWhereInput | ModelRegistryWhereInput[]
    OR?: ModelRegistryWhereInput[]
    NOT?: ModelRegistryWhereInput | ModelRegistryWhereInput[]
    id?: StringFilter<"ModelRegistry"> | string
    modelId?: StringFilter<"ModelRegistry"> | string
    tenantId?: StringFilter<"ModelRegistry"> | string
    name?: StringFilter<"ModelRegistry"> | string
    version?: StringFilter<"ModelRegistry"> | string
    status?: StringFilter<"ModelRegistry"> | string
    config?: JsonNullableFilter<"ModelRegistry">
    metadata?: JsonNullableFilter<"ModelRegistry">
    createdAt?: DateTimeFilter<"ModelRegistry"> | Date | string
    updatedAt?: DateTimeFilter<"ModelRegistry"> | Date | string
  }

  export type ModelRegistryOrderByWithRelationInput = {
    id?: SortOrder
    modelId?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    status?: SortOrder
    config?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModelRegistryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    modelId?: string
    AND?: ModelRegistryWhereInput | ModelRegistryWhereInput[]
    OR?: ModelRegistryWhereInput[]
    NOT?: ModelRegistryWhereInput | ModelRegistryWhereInput[]
    tenantId?: StringFilter<"ModelRegistry"> | string
    name?: StringFilter<"ModelRegistry"> | string
    version?: StringFilter<"ModelRegistry"> | string
    status?: StringFilter<"ModelRegistry"> | string
    config?: JsonNullableFilter<"ModelRegistry">
    metadata?: JsonNullableFilter<"ModelRegistry">
    createdAt?: DateTimeFilter<"ModelRegistry"> | Date | string
    updatedAt?: DateTimeFilter<"ModelRegistry"> | Date | string
  }, "id" | "modelId">

  export type ModelRegistryOrderByWithAggregationInput = {
    id?: SortOrder
    modelId?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    status?: SortOrder
    config?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ModelRegistryCountOrderByAggregateInput
    _max?: ModelRegistryMaxOrderByAggregateInput
    _min?: ModelRegistryMinOrderByAggregateInput
  }

  export type ModelRegistryScalarWhereWithAggregatesInput = {
    AND?: ModelRegistryScalarWhereWithAggregatesInput | ModelRegistryScalarWhereWithAggregatesInput[]
    OR?: ModelRegistryScalarWhereWithAggregatesInput[]
    NOT?: ModelRegistryScalarWhereWithAggregatesInput | ModelRegistryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ModelRegistry"> | string
    modelId?: StringWithAggregatesFilter<"ModelRegistry"> | string
    tenantId?: StringWithAggregatesFilter<"ModelRegistry"> | string
    name?: StringWithAggregatesFilter<"ModelRegistry"> | string
    version?: StringWithAggregatesFilter<"ModelRegistry"> | string
    status?: StringWithAggregatesFilter<"ModelRegistry"> | string
    config?: JsonNullableWithAggregatesFilter<"ModelRegistry">
    metadata?: JsonNullableWithAggregatesFilter<"ModelRegistry">
    createdAt?: DateTimeWithAggregatesFilter<"ModelRegistry"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ModelRegistry"> | Date | string
  }

  export type WeightMappingWhereInput = {
    AND?: WeightMappingWhereInput | WeightMappingWhereInput[]
    OR?: WeightMappingWhereInput[]
    NOT?: WeightMappingWhereInput | WeightMappingWhereInput[]
    id?: StringFilter<"WeightMapping"> | string
    mediaId?: StringFilter<"WeightMapping"> | string
    weightKg?: FloatFilter<"WeightMapping"> | number
    tenantId?: StringNullableFilter<"WeightMapping"> | string | null
    metadata?: JsonNullableFilter<"WeightMapping">
    createdAt?: DateTimeFilter<"WeightMapping"> | Date | string
    updatedAt?: DateTimeFilter<"WeightMapping"> | Date | string
  }

  export type WeightMappingOrderByWithRelationInput = {
    id?: SortOrder
    mediaId?: SortOrder
    weightKg?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightMappingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WeightMappingWhereInput | WeightMappingWhereInput[]
    OR?: WeightMappingWhereInput[]
    NOT?: WeightMappingWhereInput | WeightMappingWhereInput[]
    mediaId?: StringFilter<"WeightMapping"> | string
    weightKg?: FloatFilter<"WeightMapping"> | number
    tenantId?: StringNullableFilter<"WeightMapping"> | string | null
    metadata?: JsonNullableFilter<"WeightMapping">
    createdAt?: DateTimeFilter<"WeightMapping"> | Date | string
    updatedAt?: DateTimeFilter<"WeightMapping"> | Date | string
  }, "id">

  export type WeightMappingOrderByWithAggregationInput = {
    id?: SortOrder
    mediaId?: SortOrder
    weightKg?: SortOrder
    tenantId?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WeightMappingCountOrderByAggregateInput
    _avg?: WeightMappingAvgOrderByAggregateInput
    _max?: WeightMappingMaxOrderByAggregateInput
    _min?: WeightMappingMinOrderByAggregateInput
    _sum?: WeightMappingSumOrderByAggregateInput
  }

  export type WeightMappingScalarWhereWithAggregatesInput = {
    AND?: WeightMappingScalarWhereWithAggregatesInput | WeightMappingScalarWhereWithAggregatesInput[]
    OR?: WeightMappingScalarWhereWithAggregatesInput[]
    NOT?: WeightMappingScalarWhereWithAggregatesInput | WeightMappingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WeightMapping"> | string
    mediaId?: StringWithAggregatesFilter<"WeightMapping"> | string
    weightKg?: FloatWithAggregatesFilter<"WeightMapping"> | number
    tenantId?: StringNullableWithAggregatesFilter<"WeightMapping"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"WeightMapping">
    createdAt?: DateTimeWithAggregatesFilter<"WeightMapping"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WeightMapping"> | Date | string
  }

  export type DatasetExportCreateInput = {
    id?: string
    datasetS3: string
    rows: number
    metaJson?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DatasetExportUncheckedCreateInput = {
    id?: string
    datasetS3: string
    rows: number
    metaJson?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DatasetExportUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    datasetS3?: StringFieldUpdateOperationsInput | string
    rows?: IntFieldUpdateOperationsInput | number
    metaJson?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatasetExportUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    datasetS3?: StringFieldUpdateOperationsInput | string
    rows?: IntFieldUpdateOperationsInput | number
    metaJson?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatasetExportCreateManyInput = {
    id?: string
    datasetS3: string
    rows: number
    metaJson?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DatasetExportUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    datasetS3?: StringFieldUpdateOperationsInput | string
    rows?: IntFieldUpdateOperationsInput | number
    metaJson?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DatasetExportUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    datasetS3?: StringFieldUpdateOperationsInput | string
    rows?: IntFieldUpdateOperationsInput | number
    metaJson?: NullableJsonNullValueInput | InputJsonValue
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModelRegistryCreateInput = {
    id?: string
    modelId: string
    tenantId: string
    name: string
    version: string
    status?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModelRegistryUncheckedCreateInput = {
    id?: string
    modelId: string
    tenantId: string
    name: string
    version: string
    status?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModelRegistryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModelRegistryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModelRegistryCreateManyInput = {
    id?: string
    modelId: string
    tenantId: string
    name: string
    version: string
    status?: string
    config?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ModelRegistryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ModelRegistryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    modelId?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    config?: NullableJsonNullValueInput | InputJsonValue
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightMappingCreateInput = {
    id?: string
    mediaId: string
    weightKg: number
    tenantId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightMappingUncheckedCreateInput = {
    id?: string
    mediaId: string
    weightKg: number
    tenantId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightMappingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    weightKg?: FloatFieldUpdateOperationsInput | number
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightMappingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    weightKg?: FloatFieldUpdateOperationsInput | number
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightMappingCreateManyInput = {
    id?: string
    mediaId: string
    weightKg: number
    tenantId?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeightMappingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    weightKg?: FloatFieldUpdateOperationsInput | number
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeightMappingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    mediaId?: StringFieldUpdateOperationsInput | string
    weightKg?: FloatFieldUpdateOperationsInput | number
    tenantId?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type DatasetExportCountOrderByAggregateInput = {
    id?: SortOrder
    datasetS3?: SortOrder
    rows?: SortOrder
    metaJson?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatasetExportAvgOrderByAggregateInput = {
    rows?: SortOrder
  }

  export type DatasetExportMaxOrderByAggregateInput = {
    id?: SortOrder
    datasetS3?: SortOrder
    rows?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatasetExportMinOrderByAggregateInput = {
    id?: SortOrder
    datasetS3?: SortOrder
    rows?: SortOrder
    tenantId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DatasetExportSumOrderByAggregateInput = {
    rows?: SortOrder
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

  export type ModelRegistryCountOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    status?: SortOrder
    config?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModelRegistryMaxOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ModelRegistryMinOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    version?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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

  export type WeightMappingCountOrderByAggregateInput = {
    id?: SortOrder
    mediaId?: SortOrder
    weightKg?: SortOrder
    tenantId?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightMappingAvgOrderByAggregateInput = {
    weightKg?: SortOrder
  }

  export type WeightMappingMaxOrderByAggregateInput = {
    id?: SortOrder
    mediaId?: SortOrder
    weightKg?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightMappingMinOrderByAggregateInput = {
    id?: SortOrder
    mediaId?: SortOrder
    weightKg?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeightMappingSumOrderByAggregateInput = {
    weightKg?: SortOrder
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
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