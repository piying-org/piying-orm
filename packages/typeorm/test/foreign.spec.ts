import * as v from 'valibot';
import { expect } from 'chai';
import {
  columnPrimaryKey,
  entity,
  columnForeignKey,
  entityForeignKey,
} from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { StrColumn } from './util/schema';

describe('foreign', () => {
  it('列外键', async () => {
    const City = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        countryCode: v.pipe(
          StrColumn,
          columnForeignKey({
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            target: () => Country,
          }),
        ),
        name: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'CityT',
        name: 'City',
      }),
    );
    const Country = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        name: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'CountryT',
        name: 'Country',
      }),
    );
    const { object, dataSource } = await createInstance({ City, Country });

    const result = await dataSource.query(
      `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'CityT';`,
    );
    expect(
      result.some(
        (item: any) =>
          item.sql?.includes('FOREIGN KEY') &&
          item.sql?.includes('countryCode'),
      ),
    );
  });
  it('实体外键', async () => {
    const City = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        countryCode: StrColumn,
        name: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'CityT',
        name: 'City',
      }),
      entityForeignKey([
        {
          target: () => Country,
          columnNames: ['countryCode'],
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      ]),
    );
    const Country = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        name: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'CountryT',
        name: 'Country',
      }),
    );
    const { object, dataSource } = await createInstance({ City, Country });
    const result = await dataSource.query(
      `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'CityT';`,
    );
    expect(
      result.some(
        (item: any) =>
          item.sql?.includes('FOREIGN KEY') &&
          item.sql?.includes('countryCode'),
      ),
    );
  });
});
