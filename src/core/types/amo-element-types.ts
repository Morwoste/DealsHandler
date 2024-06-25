import { CustomFieldTypes } from '../consts/custom-fields-types';

export type CustomFieldValue =
    | {
          value: string | number | boolean;
          enum_id?: number;
          enum_code?: string;
      }
    | string;

export type CustomField = {
    field_id?: number;
    id?: number;
    field_type?: CustomFieldTypes;
    values: CustomFieldValue[];
};

export type RequestParams = {
    page: number;
    limit: number;
};
