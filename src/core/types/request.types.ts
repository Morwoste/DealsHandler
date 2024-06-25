import { Deal } from 'src/modules/amo-api/types/amo-api.types';
import { HookActions } from '../consts/hook-actions';


export type HookReportsRequestBody = {
    leads: {
        [key in HookActions]: Deal[];
    };
    account: {
        subdomain: string;
        id: number;
        _links: { self: string };
    };
};