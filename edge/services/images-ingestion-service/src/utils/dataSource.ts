// Deprecated TypeORM datasource. Kept only to avoid import errors during transition.
export const AppDataSource: any = { initialize: async () => {}, destroy: async () => {}, createQueryRunner: () => { throw new Error('QueryRunner not available after Prisma migration'); } };

