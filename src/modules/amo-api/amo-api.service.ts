import {
    Injectable,
    HttpException,
    HttpStatus,
    forwardRef,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { AuthTypes } from 'src/core/consts/auth-types';
import { LoggerService } from 'src/core/logger/logger.service';
import {
    Deal,
    EntityWithDeals,
    EntityWithPipelines,
    Pipeline,
    PipelineWithStatuses,
    TokensResponse,
} from './types/amo-api.types';
import { ConfigService } from '@nestjs/config';
import { AccountDocument } from '../account/account.model';
import { AccountService } from '../account/account.service';
import { AccountRepository } from '../account/account.repository';
import { ErrorHandler } from 'src/core/decorators/IsRequestSuccess.decorator';
import { ERRORS } from 'src/core/consts/error-messages';

@Injectable()
export class AmoApiService {
    constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => AccountRepository))
        private readonly accountRepository: AccountRepository,
        @Inject(forwardRef(() => AccountService))
        private readonly accountService: AccountService,
        private readonly logger: LoggerService
    ) {}
    public async requestAccessToken(
        subdomain: string,
        code: string
    ): Promise<TokensResponse> {
        const loggerContext = `${AmoApiService.name}/${this.requestAccessToken.name}`;
        try {
            const { data: tokens } = await axios.post<TokensResponse>(
                `https://${subdomain}.amocrm.ru/oauth2/access_token`,
                {
                    client_id: this.configService.get('CLIENT_ID'),
                    client_secret: this.configService.get('CLIENT_SECRET'),
                    grant_type: AuthTypes.Auth,
                    code,
                    redirect_uri: this.configService.get('REDIRECT_URI'),
                },
                {
                    headers: {
                        'Accept-encoding': 'utf-8',
                    },
                }
            );
            return tokens;
        } catch (error) {
            const err = error as AxiosError;
            this.logger.error(err.response.data, loggerContext);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ErrorHandler()
    public async getDeals(
        accountId: number,
        pipelinesWithStatuses: PipelineWithStatuses[],
        params = {
            page: 1,
            limit: 250,
            subdomain: '',
            accessToken: '',
        }
    ): Promise<Deal[]> {
        if (!accountId) {
            this.logger.error(ERRORS.NO_AMO_ID);
            throw new BadRequestException(ERRORS.NO_AMO_ID);
        }
        if (!params.accessToken || !params.subdomain) {
            const account = await this.accountService.getAccount(accountId);
            if (!account) {
                this.logger.error(ERRORS.NO_ACCOUNT_FOUND);
                throw new NotFoundException(ERRORS.NO_ACCOUNT_FOUND);
            }
            params.accessToken = account.accessToken;
            params.subdomain = account.subdomain;
        }

        const deals = await axios.get<EntityWithDeals>(
            `https://${params.subdomain}.amocrm.ru/api/v4/leads?${JSON.stringify(
                {
                    filter: {
                        statuses: pipelinesWithStatuses,
                    },
                    limit: params.limit,
                    page: params.page,
                }
            )}`,
            {
                headers: {
                    Authorization: `Bearer ${params.accessToken}`,
                },
            }
        );

        if (deals.data._embedded.leads.length === params.limit) {
            const nextPageDeals = await this.getDeals(
                accountId,
                pipelinesWithStatuses,
                {
                    ...params,
                    page: params.page + 1,
                }
            );

            return [...nextPageDeals, ...deals.data._embedded.leads];
        }

        return deals.data._embedded.leads || [];
    }

    @ErrorHandler()
    public async getPipelinesByAccount(accountId: number): Promise<Pipeline[]> {
        if (!accountId) {
            this.logger.error(ERRORS.NO_AMO_ID);
            throw new BadRequestException(ERRORS.NO_AMO_ID);
        }
        const account = await this.accountService.getAccount(accountId);
        if (!account) {
            this.logger.error(ERRORS.NO_ACCOUNT_FOUND);
            throw new NotFoundException(ERRORS.NO_ACCOUNT_FOUND);
        }
        const pipelines = await axios.get(
            `https://${account.subdomain}.amocrm.ru/api/v4/leads/pipelines`,
            {
                headers: {
                    Authorization: `Bearer ${account.accessToken}`,
                },
            }
        );
        return pipelines.data._embedded.pipelines || [];
    }

    public async refreshTokens(
        user: AccountDocument & { authCode?: string }
    ): Promise<void> {
        const loggerContext = `${AccountService.name}/${this.refreshTokens.name}`;

        try {
            const { data: tokens } = await axios.post<TokensResponse>(
                `https://${user.subdomain}.amocrm.ru/oauth2/access_token`,
                {
                    client_id: this.configService.get('CLIENT_ID'),
                    client_secret: this.configService.get('CLIENT_SECRET'),
                    grant_type: AuthTypes.Refresh,
                    refresh_token: user.refreshToken,
                }
            );
            user.accessToken = tokens.access_token;
            await this.accountRepository.updateAccountByID(user);
        } catch (error) {
            this.logger.error(error, loggerContext);
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}