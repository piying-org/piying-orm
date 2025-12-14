import * as v from 'valibot';
import { expect } from 'chai';

import { createInstance } from './util/create-builder';
import { IDSchema } from './util/schema';

describe('embedded', () => {
  it('1层', async () => {
    const define = v.pipe(
      v.object({
        id: IDSchema,
        o1: v.object({
          k1: v.string(),
        }),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ o1: { k1: '123' } }]);
    const result = await repo.find();
    expect(result[0].o1.k1).eq('123');
  });
  it('2层', async () => {
    const define = v.pipe(
      v.object({
        id: IDSchema,
        o1: v.object({
          o2: v.object({
            k1: v.string(),
          }),
        }),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ o1: { o2: { k1: '123' } } }]);
    const result = await repo.find();
    expect(result[0].o1.o2.k1).eq('123');
  });
  it('intersect', async () => {
    const define = v.pipe(
      v.object({
        id: IDSchema,
        o1: v.intersect([
          v.object({
            o2: v.intersect([
              v.object({
                k1: v.string(),
              }),
            ]),
          }),
        ]),
      }),
    );
    const { object, dataSource } = await createInstance({ tableTest: define });

    const repo = dataSource.getRepository(object.tableTest);
    await repo.save([{ o1: { o2: { k1: '123' } } }]);
    const result = await repo.find();
    expect(result[0].o1.o2.k1).eq('123');
  });
});
