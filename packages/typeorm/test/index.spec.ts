import {
  columnIndex,
  columnPrimaryKey,
  entity,
  entityIndex,
} from '@piying/orm/core';
import { expect } from 'chai';
import * as v from 'valibot';
import { createInstance } from './util/create-builder';
import { StrColumn } from './util/schema';

describe('index', () => {
  it('column index', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        idxCol1: v.pipe(StrColumn, columnIndex()),
        idxCol2: v.pipe(StrColumn, columnIndex({ name: 'abc' })),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    const result = await dataSource.query(`SELECT sql,name
FROM sqlite_master
WHERE type = 'index' AND tbl_name = 'tableTest';`);
    expect(result.length).eq(3);
    expect(result.some((item: any) => item.name === 'abc')).true;
    expect(
      result.some((item: any) => (item.sql as string)?.includes('idxCol1')),
    ).true;
    expect(
      result.some((item: any) => (item.sql as string)?.includes('idxCol2')),
    ).true;
  });
  it('entity index', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        idxCol1: StrColumn,
        idxCol2: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
      entityIndex([
        {
          columns: ['idxCol1'],
        },
        {
          columns: ['idxCol2'],
          name: 'abc',
        },
      ]),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    const result = await dataSource.query(`SELECT sql,name
FROM sqlite_master
WHERE type = 'index' AND tbl_name = 'tableTest';`);
    expect(result.length).eq(3);
    expect(result.some((item: any) => item.name === 'abc')).true;
    expect(
      result.some((item: any) => (item.sql as string)?.includes('idxCol1')),
    ).true;
    expect(
      result.some((item: any) => (item.sql as string)?.includes('idxCol2')),
    ).true;
  });
});
