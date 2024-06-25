import { CustomField } from 'src/core/types/amo-element-types';

export type TokensResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
};

export type AmoAccount = {
    id: number;
    name: string;
    subdomain: string;
    created_at: number;
    created_by: number;
    updated_at: number;
    updated_by: number;
    current_user_id: number;
    country: string;
    customers_mode: string;
    is_unsorted_on: boolean;
    is_loss_reason_enabled: boolean;
    is_helpbot_enabled: boolean;
    is_technical_account: boolean;
    contact_name_display_order: number;
    amojo_id: string;
    uuid: string;
    version: number;
};

export type Pipeline = {
    id: number;
    name: string;
    sort: number;
    is_main: boolean;
    is_unsorted_on: boolean;
    is_archive: boolean;
    account_id: number;
    _links: links;
    _embedded: {
        statuses: statusPipeline[];
    };
};

type links = {
    self: {
        href: string;
    };
};

type statusPipeline = {
    id: number;
    name: string;
    sort: number;
    is_editable: boolean;
    pipeline_id: number;
    color: string;
    type: number;
    account_id: number;
    _links: links;
};

export type EntityWithPipelines = {
    _total_items: number;
    _links: links;
    _embedded: {
        pipelines: Pipeline[];
    };
};

type keysCustomFields = 'custom_fields_values';

export type PipelineWithStatuses = {
    pipeline_id: number;
    status_id: number;
};
export type Deal = {
    custom_fields_values?: CustomField[];
} & {
    id: number;
    name: string;
    price: number;
    responsible_user_id: number | string;
    group_id: number;
    status_id: string;
    pipeline_id: number;
    account_id: number;
    created_at: number;
    closed_at: number;
    _embedded: {
        tags: TagsEmbeddedDeal;
        companies: CompanyEmbeddedDeal;
    };
    _links: links;
};

type TagsEmbeddedDeal = {
    id: number;
    name: string;
    color: string;
};

type CompanyEmbeddedDeal = {
    id: number;
};

export type CustomFieldValue = {
    value: string | number | boolean;
    enum_id?: number;
    enum_code?: string;
};

export type EntityWithDeals = {
    _page: number;
    _links: links;
    _embedded: { leads: Deal[] };
};
