export type FieldFormConfig = {
  required: boolean;
  defaultValue: boolean;
};

export interface DefaultOrmConfig {
  types: Record<string, { type: any }>;
}
