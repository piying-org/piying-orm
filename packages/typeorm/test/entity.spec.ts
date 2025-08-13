import * as v from 'valibot';
import { expect } from 'chai';
import {
  columnPrimaryKey,
  entity,
  entityUnique,
  entityCheck,
  entityExclusion,
} from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { IDSchema, StrColumn } from './util/schema';

describe('entity', () => {
  it('Unique', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        name: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
      entityUnique([{ columns: ['name'] }]),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    const result = await dataSource.query(`SELECT *
FROM sqlite_master
WHERE type = 'table' and tbl_name = 'tableTest';`);
    expect(result[0].sql).contain('CONSTRAINT');
    expect(result[0].sql).contain('UNIQUE');
    expect(result[0].sql).contain('name');
    try {
      await repo.save([{ name: 'v1' }, { name: 'v1' }]);
    } catch (error) {
      expect((error as any).code).eq('SQLITE_CONSTRAINT_UNIQUE');
      return;
    }
    throw new Error('保存唯一约束失败');
  });
  it('check', async () => {
    const define = v.pipe(
      v.object({
        id: IDSchema,
        age: v.number(),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
      entityCheck([{ expression: '"age" > 18' }]),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    await repo.save(repo.create({ age: 19 }));
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    try {
      await repo.save([{ age: 18 }]);
    } catch (error) {
      expect((error as any).code).eq('SQLITE_CONSTRAINT_CHECK');
      return;
    }
    throw new Error('SQLITE_CONSTRAINT_CHECK失败');
  });
  it('entityExclusion', async () => {
    const define = v.pipe(
      v.object({
        room: v.string(),
        from: v.date(),
        to: v.date(),
      }),
      entityExclusion({
        expression: `USING gist ("room" WITH =, tsrange("from", "to") WITH &&)`,
      }),
    );
    const { object, dataSource } = await createInstance(
      { tableTest: define },
      undefined,
      { disableInit: true },
    );
    expect(object.tableTest.options.exclusions?.length).eq(1);
    expect(object.tableTest.options.exclusions?.[0].expression).eq(
      `USING gist ("room" WITH =, tsrange("from", "to") WITH &&)`,
    );
  });
});
