export type FieldFormConfig = {
  required: boolean;
  defaultValue: any;
};

export interface DefaultOrmConfig {
  types: Record<string, { type: any }>;
}
