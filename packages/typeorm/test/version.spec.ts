import * as v from 'valibot';
import { expect } from 'chai';
import { entity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { column } from '../../core/action/column-schema';
import { ID, StrColumn } from './util/schema';

describe('version', () => {
  it('自动更新', async () => {
    const define = v.pipe(
      v.intersect([
        ID,
        v.object({
          name: StrColumn,
          version: v.pipe(v.number(), column({ version: true })),
        }),
      ]),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([repo.create({ name: '11' })]);
    let entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].version).eq(1);
    await repo.save([{ id: entityList[0].id, name: '22' }]);
    entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].version).eq(2);
  });
});
