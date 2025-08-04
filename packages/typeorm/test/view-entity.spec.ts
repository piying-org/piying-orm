import * as v from 'valibot';
import { expect } from 'chai';
import { manyToOne, entity, viewEntity } from '@piying/orm/core';
import { createInstance } from './util/create-builder';
import { ID, StrColumn } from './util/schema';

describe('viewEntity', () => {
  it('视图实体', async () => {
    const Category = v.pipe(
      v.intersect([
        ID,
        v.object({
          name: StrColumn,
        }),
      ]),
      entity({
        tableName: 'Category',
        name: 'Category',
      }),
    );
    const Post = v.pipe(
      v.intersect([
        ID,
        v.object({
          name: StrColumn,
          categoryId: v.string(),
          category: v.pipe(
            v.lazy(() => Category),
            manyToOne({
              target: () => Category,
              joinColumn: { name: 'categoryId' },
            }),
          ),
        }),
      ]),
      entity({
        tableName: 'Post',
        name: 'Post',
      }),
    );
    const PostCategory = v.pipe(
      v.intersect([
        ID,
        v.object({
          name: StrColumn,
          categoryName: StrColumn,
        }),
      ]),
      viewEntity({
        tableName: 'PostCategory',
        name: 'PostCategory',
        expression: (dataSource, instance) =>
          dataSource
            .createQueryBuilder()
            .select('post.id', 'id')
            .addSelect('post.name', 'name')
            .addSelect('category.name', 'categoryName')
            .from(instance.getEntity(Post), 'post')
            .leftJoin(
              instance.getEntity(Category),
              'category',
              'category.id = post.categoryId',
            ),
      }),
    );
    const { object, dataSource } = await createInstance({
      Category,
      Post,
      PostCategory,
    });

    const CategoryRepo = dataSource.getRepository(object.Category);
    const PostRepo = dataSource.getRepository(object.Post);
    const PostCategoryRepo = dataSource.getRepository(object.PostCategory);
    const category1 = CategoryRepo.create({ name: 'aa' });
    await CategoryRepo.save([category1]);
    const post1 = PostRepo.create({ name: 'bb', category: category1 });
    await PostRepo.save([post1]);
    const postList = await PostRepo.find();
    expect('categoryId' in postList[0]).ok;
    const entityList = await PostCategoryRepo.find();
    expect(entityList[0].name).eq('bb');
    expect(entityList[0].categoryName).eq('aa');
  });
});
