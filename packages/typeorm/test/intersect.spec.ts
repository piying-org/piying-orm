import * as v from 'valibot';
import { expect } from 'chai';
import { columnPrimaryKey, entity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { StrColumn } from './util/schema';

describe('intersect', () => {
  it('and', async () => {
    const define = v.pipe(
      v.intersect([
        v.object({
          id: v.pipe(
            v.string(),
            columnPrimaryKey({ primary: true, generated: 'uuid' }),
          ),
        }),
        v.object({
          name: StrColumn,
        }),
      ]),
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
});
