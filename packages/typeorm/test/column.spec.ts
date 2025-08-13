import * as v from 'valibot';
import { expect } from 'chai';
import { columnObjectId, columnPrimaryKey, entity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { column, noColumn } from '../../core/action/column-schema';
import { StrColumn } from './util/schema';
import { asControl } from '@piying/valibot-visit';

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
  it('simple-enum', async () => {
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
        p1: v.pipe(v.enum(E1), column({ type: 'simple-enum' })),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });
    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ p1: E1.b }]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].p1).eq(2);
  });

  it('simple-array', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        list: v.pipe(
          v.array(v.string()),
          asControl(),
          column({ type: 'simple-array' }),
        ),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });
    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ list: ['1', '2'] }]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].list).deep.eq(['1', '2']);
  });
  it('simple-json', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        obj: v.pipe(
          v.object({ k1: v.string(), k2: v.number() }),
          asControl(),
          column({ type: 'simple-json' }),
        ),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });
    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ obj: { k1: '1', k2: 2 } }]);
    const entityList = await repo.find();
    expect(entityList.length).eq(1);
    expect(entityList[0].obj).deep.eq({ k1: '1', k2: 2 });
  });

  it('array(postgres)', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        list: v.pipe(v.array(v.string()), column({ array: true })),
      }),
    );
    const { object, dataSource } = await createInstance(
      { tableTest: define },
      undefined,
      { disableInit: true },
    );
    expect(object.tableTest.options.columns.list?.array).eq(true);
    expect(object.tableTest.options.columns.list?.type).eq(String);
  });
  it('objectId(mongodb)', async () => {
    const define = v.pipe(
      v.object({
        _id: v.pipe(
          v.string(),
          columnObjectId(),
        ),
        k1: v.pipe(v.string(), column()),
      }),
    );
    const { object, dataSource } = await createInstance(
      { tableTest: define },
      undefined,
      { disableInit: true },
    );

    expect(object.tableTest.options.columns._id).ok;
    expect(object.tableTest.options.columns._id?.objectId).true;
    expect(object.tableTest.options.columns._id?.primary).true;
  });
  it('array-columns(mongodb)', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        other1: v.pipe(
          v.array(v.object({ likes: v.number(), text: v.string() })),
          column({ array: true }),
        ),
      }),
    );
    const { object, dataSource } = await createInstance(
      { tableTest: define },
      undefined,
      { disableInit: true },
    );

    expect(object.tableTest.options.embeddeds?.other1).ok;
    expect(object.tableTest.options.embeddeds?.other1?.array).true;
    expect(object.tableTest.options.embeddeds?.other1?.schema).ok;
    expect(
      object.tableTest.options.embeddeds?.other1?.schema.options.columns[
        'likes'
      ],
    ).ok;
  });
});
