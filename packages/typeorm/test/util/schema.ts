import { column, columnPrimaryKey } from '@piying/orm/core';
import * as v from 'valibot';
export const IDSchema = v.pipe(
  v.number(),
  columnPrimaryKey({ generated: true }),
);
export const ID = v.object({
  id: v.pipe(v.number(), columnPrimaryKey({ generated: true })),
});
export const StrColumn = v.pipe(v.string(), column());
