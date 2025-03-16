export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestHeader = {
  key: string;
  value: string;
  enabled: boolean;
};

export type QueryParam = {
  key: string;
  value: string;
  enabled: boolean;
};

export type ApiRequest = {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: RequestHeader[];
  queryParams: QueryParam[];
  body: string;
};

export type Collection = {
  id: string;
  name: string;
  requests: ApiRequest[];
};

export type ApiResponse = {
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
};
