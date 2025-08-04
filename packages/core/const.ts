import { DefaultOrmConfig } from './type';

export const DEFAULT_ORM_CONFIG: DefaultOrmConfig = {
  types: {
    string: { type: String },
    number: { type: Number },
    boolean: { type: Boolean },
    object: { type: Object },
    array: { type: Array },
    date: { type: Date },
  },
};
