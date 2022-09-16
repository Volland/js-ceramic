import type { Knex } from 'knex'
import { UnreachableCaseError } from '@ceramicnetwork/common'

export enum ColumnType {
  STRING,
}

export type ColumnInfo = {
  name: string
  type: ColumnType
}

export async function createModelTable(
  dbConnection: Knex,
  tableName: string,
  extraColumns: Array<ColumnInfo>
) {
  await dbConnection.schema.createTable(tableName, (table) => {
    table.string('stream_id', 1024).primary().unique().notNullable()
    table.string('controller_did', 1024).notNullable()
    table.string('stream_content').notNullable()
    table.string('tip').notNullable()
    table.integer('last_anchored_at').nullable()
    table.integer('first_anchored_at').nullable()
    table.integer('created_at').notNullable()
    table.integer('updated_at').notNullable()

    for (const column of extraColumns) {
      switch (column.type) {
        case ColumnType.STRING:
          table.string(column.name, 1024).notNullable()
          table.index([column.name], `idx_${tableName}_${column.name}`)
          break
        default:
          throw new UnreachableCaseError(column.type, `Invalid column type`)
      }
    }

    table.index(['last_anchored_at'], `idx_${tableName}_last_anchored_at`)
    table.index(['created_at'], `idx_${tableName}_created_at`)
    table.index(['updated_at'], `idx_${tableName}_updated_at`)
    table.index(['last_anchored_at', 'created_at'], `idx_${tableName}_last_anchored_at_created_at`)
    table.index(['first_anchored_at'], `idx_${tableName}_first_anchored_at`)
    table.index(
      ['first_anchored_at', 'created_at'],
      `idx_${tableName}_first_anchored_at_created_at`
    )
  })
}
