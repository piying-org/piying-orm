import * as v from 'valibot';
import { expect } from 'chai';
import { entity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { column } from '../../core/action/column-schema';
import { ID, StrColumn } from './util/schema';

describe('date', () => {
  it('CreateDateColumn', async () => {
    const define = v.pipe(
      v.intersect([
        ID,
        v.object({
          date: v.pipe(v.date(), column({ createDate: true })),
        }),
      ]),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([repo.create({})]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].date instanceof Date).true;
  });
  it('updateDate', async () => {
    const define = v.pipe(
      v.intersect([
        ID,
        v.object({
          name: StrColumn,
          date: v.pipe(v.date(), column({ updateDate: true })),
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
    expect(entityList[0].date instanceof Date).true;
    const date = entityList[0].date;
    await new Promise<void>((res) => {
      setTimeout(() => {
        res();
      }, 1000);
    });
    await repo.save([{ id: entityList[0].id, name: '22' }]);
    entityList = await repo.find();
    expect(date.valueOf() !== entityList[0].date.valueOf()).true;
  });
  it('deleteDate', async () => {
    const define = v.pipe(
      v.intersect([
        ID,
        v.object({
          name: StrColumn,
          date: v.pipe(v.date(), column({ deleteDate: true })),
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
    expect(entityList[0].date instanceof Date).false;
    await repo.softRemove(entityList);
    entityList = await repo.find({ withDeleted: true });
    expect(entityList[0].date instanceof Date).true;
  });
});
