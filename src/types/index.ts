export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: RequestHeader[];
  queryParams: QueryParam[];
  body: string;
}

export interface Collection {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  contentType: string;
  size: {
    headers: number;
    body: number;
  };
  time: number; // Response time in milliseconds
}