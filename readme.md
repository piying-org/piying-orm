<div><a href="https://www.npmjs.com/package/@piying/orm"><img src="https://img.shields.io/npm/v/@piying/orm" alt="NPM Version" /></a> <a href="https://coveralls.io/github/piying-org/piying-orm?branch=main"><img src="https://coveralls.io/repos/github/piying-org/piying-orm/badge.svg" alt="Coverage Status" ></a> <a href=""><img src="https://img.shields.io/badge/License-MIT-teal.svg" alt="MIT License" /></a></div>


## document

- https://piying-org.github.io/website/docs/orm/intro


## Use

```ts
import { convert, column, columnPrimaryKey } from "@piying/orm/typeorm";
import * as v from 'valibot';
export const Account = v.pipe(
  v.object({
    id: v.pipe(v.string(), columnPrimaryKey({ generated: "uuid" })),
    createdAt: v.pipe(v.date(), column({ createDate: true })),
    updateAt: v.pipe(v.date(), column({ updateDate: true })),
    username: v.pipe(v.string(), v.title("用户名"), column({ length: 50 })),
  }),
);
const instance = convert(
  {
    Account,
  },
  {
    dataSourceOptions: {
      type: "better-sqlite3",
      database: path.join(process.cwd(), ".tmp", "data.sqlite"),
      synchronize: false,
      logging: true,
    },
  },
);
await instance.dataSource.initialize();
result.object.Account;
```