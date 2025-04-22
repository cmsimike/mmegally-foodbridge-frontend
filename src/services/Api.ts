/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ClaimFoodRequest {
  /**
   * @minLength 2
   * @maxLength 100
   */
  claimerName: string;
}

export interface Donor {
  /** @format uuid */
  id?: string;
  /**
   * @minLength 1
   * @maxLength 50
   */
  username: string;
  /** @minLength 1 */
  passwordHash: string;
  /** @format date-time */
  createdAt?: string;
  store?: Store;
}

export interface FoodItem {
  /** @format uuid */
  id?: string;
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /** @maxLength 500 */
  description?: string | null;
  /** @format date-time */
  expirationDate: string;
  /** @format date-time */
  createdAt: string;
  isClaimed?: boolean;
  /** @maxLength 10 */
  claimCode?: string | null;
  /** @format uuid */
  storeId: string;
  store?: Store;
}

export interface LoginDonorRequest {
  /** @minLength 1 */
  username: string;
  /** @minLength 1 */
  password: string;
}

export interface RegisterDonorRequest {
  /**
   * @minLength 3
   * @maxLength 50
   */
  username: string;

  /**
   * @minLength 3
   * @maxLength 50
   */
  token: string;
}

export interface RegisterStoreRequest {
  /**
   * @minLength 3
   * @maxLength 100
   */
  name: string;
  /**
   * @format double
   * @min -90
   * @max 90
   */
  latitude: number;
  /**
   * @format double
   * @min -180
   * @max 180
   */
  longitude: number;
}

export interface Store {
  /** @format uuid */
  id?: string;
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /** @format double */
  latitude: number;
  /** @format double */
  longitude: number;
  /** @format date-time */
  createdAt?: string;
  /** @format uuid */
  donorId?: string;
  donor?: Donor;
  foodItems?: FoodItem[] | null;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title FoodBridge
 * @version 1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Donor
     * @name DonorRegisterCreate
     * @request POST:/api/Donor/register
     */
    donorRegisterCreate: (data: RegisterDonorRequest, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Donor/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Donor
     * @name DonorLoginCreate
     * @request POST:/api/Donor/login
     */
    donorLoginCreate: (data: LoginDonorRequest, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Donor/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Donor
     * @name DonorStoreCreate
     * @request POST:/api/Donor/store
     */
    donorStoreCreate: (data: RegisterStoreRequest, params: RequestParams = {}) =>
      this.request<Store, any>({
        path: `/api/Donor/store`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Donor
     * @name DonorStoreList
     * @request GET:/api/Donor/store
     */
    donorStoreList: (params: RequestParams = {}) =>
      this.request<Store, any>({
        path: `/api/Donor/store`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Donor
     * @name DonorFoodCreate
     * @request POST:/api/Donor/food
     */
    donorFoodCreate: (data: FoodItem, params: RequestParams = {}) =>
      this.request<FoodItem, any>({
        path: `/api/Donor/food`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

      donorFoodMarkPickedUpCreate: (id: string, params: RequestParams = {}) =>
        this.request<FoodItem, any>({
          path: `/api/Donor/food/${id}/pickup`,
          method: "PUT",
          type: ContentType.Json,
          format: "json",
          ...params,
        }),
         
    /**
     * No description
     *
     * @tags Recipient
     * @name RecipientAvailableFoodList
     * @request GET:/api/Recipient/available-food
     */
    recipientAvailableFoodList: (
      query?: {
        /** @format double */
        latitude?: number;
        /** @format double */
        longitude?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<FoodItem[], any>({
        path: `/api/Recipient/available-food`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Recipient
     * @name RecipientClaimCreate
     * @request POST:/api/Recipient/claim/{id}
     */
    recipientClaimCreate: (id: string, data: ClaimFoodRequest, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/Recipient/claim/${id}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
}
