import * as v from 'valibot';
import { expect } from 'chai';
import { columnPrimaryKey, entity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { StrColumn } from './util/schema';

describe('schema提供的默认配置', () => {
  it('可选键', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        name: StrColumn,
        opt1: v.pipe(v.optional(v.string())),
        opt2: v.pipe(v.nullable(v.string())),
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
    await repo.save([repo.create({ name: 'v2', opt1: 'data1' })]);
    const result = await repo.find({ where: { name: 'v2' } });
    expect(result[0].opt1).eq('data1');
    expect(result[0].opt2).eq(null);
  });
  it('默认', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        name: StrColumn,
        opt1: v.pipe(v.optional(v.string())),
        opt2: v.pipe(v.nullable(v.string(), '123456')),
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
    await repo.save([repo.create({ name: 'v2', opt1: 'data1' })]);
    const result = await repo.find({ where: { name: 'v2' } });
    expect(result[0].opt1).eq('data1');
    expect(result[0].opt2).eq('123456');
  });

  it.skip('注释', async () => {
    const define = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        name: v.pipe(StrColumn, v.description('test name')),
      }),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const { object: list, dataSource } = await createInstance({
      tableTest: define,
    });
    // todo sqlite好像不支持注释,无法进行测试
  });
});
