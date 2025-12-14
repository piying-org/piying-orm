import * as v from 'valibot';
import { expect } from 'chai';
import { manyToOne, oneToMany, entity, treeEntity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { IDSchema, StrColumn } from './util/schema';
import {
  columnTreeChildren,
  columnTreeParent,
} from '../../core/action/column-tree';

describe('tree', () => {
  it('普通树', async () => {
    type Lazy = v.GenericSchema<
      {
        parent: v.InferInput<typeof Category>;
        children: v.InferInput<typeof Category>[];
      },
      {
        parent: v.InferOutput<typeof Category>;
        children: v.InferOutput<typeof Category>[];
      }
    >;
    const CategoryLazy: Lazy = v.pipe(
      v.object({
        parent: v.pipe(
          v.lazy(() => Category),
          manyToOne({ target: () => Category, inverseSide: 'children' }),
        ),
        children: v.pipe(
          v.lazy(() => v.array(Category)),
          oneToMany({ target: () => Category, inverseSide: 'parent' }),
        ),
      }),
    );
    const CategoryCommon = v.pipe(
      v.object({
        id: IDSchema,
        name: StrColumn,
        description: StrColumn,
      }),
    );
    const Category = v.pipe(
      v.intersect([CategoryLazy, CategoryCommon]),
      entity({
        tableName: 'Category',
        name: 'Category',
      }),
    );

    const { object, dataSource } = await createInstance({ Category });

    const repo = dataSource.getRepository(object.Category);
    const child = repo.create({ name: 'c1n', description: 'c1d' });
    await repo.save([child]);
    const parent = repo.create({
      name: 'p1n',
      description: 'p1d',
      children: [child],
    });
    await repo.save([parent]);
    const parentList = await repo.find({
      where: { name: 'p1n' },
      relations: ['children'],
    });
    console.log(parentList);
    expect(parentList.length).eq(1);
    expect(parentList[0].children.length).eq(1);
    expect(parentList[0].children[0].name).eq('c1n');
    const childList = await repo.find({
      where: { name: 'c1n' },
      relations: ['parent'],
    });
    expect(childList.length).eq(1);
    expect(childList[0].parent).ok;
    expect(childList[0].parent.name).eq('p1n');
  });
  it('定义树', async () => {
    type Lazy = v.GenericSchema<
      {
        parent: v.InferInput<typeof Category>;
        children: v.InferInput<typeof Category>[];
      },
      {
        parent: v.InferOutput<typeof Category>;
        children: v.InferOutput<typeof Category>[];
      }
    >;
    const CategoryLazy: Lazy = v.pipe(
      v.object({
        parent: v.pipe(
          v.lazy(() => Category),
          columnTreeParent(),
        ),
        children: v.pipe(
          v.lazy(() => v.array(Category)),
          columnTreeChildren(),
        ),
      }),
    );
    const CategoryCommon = v.pipe(
      v.object({
        id: IDSchema,
        name: StrColumn,
        description: StrColumn,
      }),
    );
    const Category = v.pipe(
      v.intersect([CategoryLazy, CategoryCommon]),
      treeEntity({ type: 'closure-table' }),
    );

    const { object, dataSource } = await createInstance({ Category });
    const repo = dataSource.getRepository(object.Category);
    // 树实体需要先定义父级
    const parent = repo.create({
      name: 'p1n',
      description: 'p1d',
    });
    await repo.save([parent]);
    const child = repo.create({ name: 'c1n', description: 'c1d' });
    child.parent = parent;
    await repo.save(child);
    const parentList = await repo.find({
      where: { name: 'p1n' },
      relations: ['children'],
    });
    expect(parentList.length).eq(1);
    expect(parentList[0].children.length).eq(1);
    expect(parentList[0].children[0].name).eq('c1n');
    const childList = await repo.find({
      where: { name: 'c1n' },
      relations: ['parent'],
    });
    expect(childList.length).eq(1);
    expect(childList[0].parent).ok;
    expect(childList[0].parent.name).eq('p1n');
  });
});
