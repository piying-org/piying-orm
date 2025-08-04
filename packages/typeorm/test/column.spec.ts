import * as v from 'valibot';
import { expect } from 'chai';
import { columnPrimaryKey, entity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { noColumn } from '../../core/action/column-schema';
import { StrColumn } from './util/schema';

describe('column', () => {
  it.skip('VirtualColumn', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        name: StrColumn,
        vc: v.pipe(v.string(), noColumn()),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });
    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ name: 'v1' }]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].name).eq('v1');
    expect(entityList[0].id).ok;
  });
  it('picklist', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        p1: v.picklist([1, 2, 3]),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });
    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ p1: 1 }]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].p1).eq(1);
  });
  it('enum', async () => {
    enum E1 {
      a = 1,
      b = 2,
    }
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        p1: v.enum(E1),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });
    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ p1: E1.b }]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].p1).eq(2);
  });
});
