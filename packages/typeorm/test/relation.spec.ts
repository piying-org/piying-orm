import * as v from 'valibot';
import { expect } from 'chai';
import {
  manyToMany,
  manyToOne,
  oneToMany,
  oneToOne,
  columnPrimaryKey,
  entity,
  columnRelationId,
  column,
} from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { StrColumn } from './util/schema';

describe('relation', () => {
  it('一对一', async () => {
    const define1 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        ref2: v.pipe(
          v.lazy(() => define2),
          oneToOne({ joinColumn: true, target: () => define2 }),
        ),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const define2 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        define2Value: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest2',
        name: 'test2',
      }),
    );
    const { object, dataSource } = await createInstance({ define1, define2 });

    const repo1 = dataSource.getRepository(object.define1);
    const repo2 = dataSource.getRepository(object.define2);
    const repo2data = { define2Value: 'value2' };
    await repo2.save([repo2data]);
    const repo1data = { ref2: repo2data };
    await repo1.save([repo1data]);
    // await repo.save([{ str1: 'value', num1: 1, bool1: true }]);
    const entityList = await repo1.find({ relations: ['ref2'] });
    expect(entityList.length).eq(1);
    expect(entityList[0].ref2).ok;
    expect(entityList[0].ref2.define2Value).eq('value2');
    const entityList2 = await repo2.find({});
    expect(entityList2[0].define2Value).eq('value2');
  });
  it('多对一', async () => {
    const define1 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        ref2: v.pipe(
          v.lazy(() => define2),
          manyToOne({ joinColumn: true, target: () => define2 }),
        ),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const define2 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        define2Value: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest2',
        name: 'test2',
      }),
    );
    const { object, dataSource } = await createInstance({ define1, define2 });

    const repo1 = dataSource.getRepository(object.define1);
    const repo2 = dataSource.getRepository(object.define2);
    const repo2data1 = { define2Value: 'value2' };
    await repo2.save([repo2data1]);
    const repo1data1 = { ref2: repo2data1 };
    const repo1data2 = { ref2: repo2data1 };
    await repo1.save([repo1data1, repo1data2]);

    // await repo.save([{ str1: 'value', num1: 1, bool1: true }]);
    const entityList = await repo1.find({ relations: ['ref2'] });
    expect(entityList.length).eq(2);
    expect(entityList[0].ref2).ok;
    expect(entityList[0].ref2.define2Value).eq('value2');
    expect(entityList[1].ref2).ok;
    expect(entityList[1].ref2.define2Value).eq('value2');
    expect(entityList[0].ref2).deep.eq(entityList[1].ref2);
    const entityList2 = await repo2.find({});
    expect(entityList2[0].define2Value).eq('value2');
  });
  it('一对多', async () => {
    type Lazy = v.GenericSchema<
      { user: v.InferInput<typeof User> },
      { user: v.InferOutput<typeof User> }
    >;

    const PhotoCommon = v.pipe(
      v.object({
        id: v.pipe(
          v.number(),
          columnPrimaryKey({ primary: true, generated: true }),
        ),
        url: StrColumn,
      }),
    );
    const PhotoLazy: Lazy = v.object({
      user: v.pipe(
        v.lazy(() => User),
        manyToOne({ target: () => User, inverseSide: 'photos' }),
      ),
    });
    const Photo = v.pipe(
      v.intersect([PhotoCommon, PhotoLazy]),
      entity({
        tableName: 'photo',
        name: 'photo',
      }),
    );
    const User = v.pipe(
      v.object({
        id: v.pipe(
          v.number(),
          columnPrimaryKey({ primary: true, generated: true }),
        ),
        name: StrColumn,
        photos: v.pipe(
          v.lazy(() => v.array(Photo)),
          oneToMany({ target: () => Photo, inverseSide: 'user' }),
        ),
      }),
      entity({
        tableName: 'user',
        name: 'User',
      }),
    );
    const { object, dataSource } = await createInstance({ Photo, User });

    const photo = dataSource.getRepository(object.Photo);
    const user = dataSource.getRepository(object.User);
    const photo1 = { url: 'me.jpg' };
    const photo2 = { url: 'me-and-bears.jpg' };
    await photo.save([photo1, photo2]);
    const user1 = { name: 'John', photos: [photo1, photo2] };
    await user.save([user1]);
    const entityList = await user.find({ relations: ['photos'] });
    expect(entityList.length).eq(1);
    expect(entityList[0].photos.length).eq(2);
  });
  it('多对多', async () => {
    const Category = v.pipe(
      v.object({
        id: v.pipe(v.number(), columnPrimaryKey({ generated: true })),
        name: StrColumn,
      }),
      entity({
        tableName: 'photo',
        name: 'photo',
      }),
    );
    const Question = v.pipe(
      v.object({
        id: v.pipe(v.number(), columnPrimaryKey({ generated: true })),
        title: StrColumn,
        text: StrColumn,
        categories: v.pipe(
          v.lazy(() => v.array(Category)),
          manyToMany({ target: () => Category, joinTable: true }),
        ),
      }),
      entity({
        tableName: 'user',
        name: 'User',
      }),
    );
    const { object, dataSource } = await createInstance({ Category, Question });

    const category = dataSource.getRepository(object.Category);
    const question = dataSource.getRepository(object.Question);
    const category1 = { name: 'animals' };
    const category2 = { name: 'zoo' };
    await category.save([category1, category2]);
    const question1 = {
      title: 'dogs',
      text: 'who let the dogs out?',
      categories: [category1, category2],
    };
    await question.save([question1]);
    const questionList = await question.find({ relations: ['categories'] });
    expect(questionList.length).eq(1);
    expect(questionList[0].categories.length).eq(2);
    const categoryList = await category.find({});
    expect(categoryList.length).eq(2);
  });

  it('RelationId', async () => {
    const define1 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        ref2: v.pipe(
          v.lazy(() => define2),
          oneToOne({ joinColumn: { name: 'ref2Idm' }, target: () => define2 }),
        ),
        ref2Idm: v.pipe(v.string(), columnRelationId({ relationName: 'ref2' })),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const define2 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        define2Value: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest2',
        name: 'test2',
      }),
    );
    const { object, dataSource } = await createInstance({ define1, define2 });

    const repo1 = dataSource.getRepository(object.define1);
    const repo2 = dataSource.getRepository(object.define2);
    const repo2data = { define2Value: 'value2' };
    const [repo2data2] = await repo2.save([repo2data]);
    await repo1.save([{ ref2Idm: repo2data2.id }]);
    const entityList = await repo1.find({ relations: ['ref2'] });
    expect(entityList.length).eq(1);
    expect(entityList[0].ref2).ok;
    expect(entityList[0].ref2.define2Value).eq('value2');
    expect(entityList[0].ref2.id).eq(entityList[0].ref2Idm);
    const entityList2 = await repo2.find({});
    expect(entityList2[0].define2Value).eq('value2');
  });
  // 这个问题在 https://github.com/typeorm/typeorm/issues/10413 中报告过,但是没有解决,不知道属于Bug还是特性
  it('RelationIdMOO', async () => {
    const define1 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        ref2: v.pipe(
          v.lazy(() => define2),
          manyToOne({ joinColumn: true, target: () => define2 }),
        ),
        ref2Id: v.pipe(
          v.string(),
          columnRelationId({ relationName: 'ref2' }),
          column(),
        ),
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest',
        name: 'test',
      }),
    );
    const define2 = v.pipe(
      v.object({
        id: v.pipe(
          v.string(),
          columnPrimaryKey({ primary: true, generated: 'uuid' }),
        ),
        define2Value: StrColumn,
      }),
      // entityName('test'),
      entity({
        tableName: 'tableTest2',
        name: 'test2',
      }),
    );
    const { object, dataSource } = await createInstance({ define1, define2 });

    const repo1 = dataSource.getRepository(object.define1);
    const repo2 = dataSource.getRepository(object.define2);
    const repo2data = { define2Value: 'value2' };
    const repo2Res = await repo2.save([repo2data]);
    await repo1.save([{ ref2Id: repo2Res[0].id }]);
    const entityList = await repo1.find({ relations: ['ref2'] });
    expect(entityList.length).eq(1);
    expect(entityList[0].ref2Id).ok;
  });
});
