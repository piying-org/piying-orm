import * as v from 'valibot';
import { expect } from 'chai';
import { columnPrimaryKey, entity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { column } from '../../core/action/column-schema';
import { IDSchema, StrColumn } from './util/schema';

describe('hello', () => {
  it('hello', async () => {
    const define = v.pipe(
      v.object({
        id: IDSchema,
        name: v.string(),
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
  it('基础类型', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        str1: StrColumn,
        num1: v.pipe(v.number(), column()),
        bool1: v.pipe(v.boolean(), column()),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ str1: 'value', num1: 1, bool1: true }]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].str1).eq('value');
    expect(entityList[0].num1).eq(1);
    expect(entityList[0].bool1).eq(true);
    expect(entityList[0].id).ok;
  });
});
