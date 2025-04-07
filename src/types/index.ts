export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestHeader = {
  key: string;
  value: string;
  enabled: boolean;
};

export type Param = {
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
  params: Param[];
  body: any;
};

export type Collection = {
  id: string;
  name: string;
  api_requests: ApiRequest[];
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

// AI Test Case Types

export type TestCase = {
  id: string;
  test_case_name: string;
  method: HttpMethod;
  url: string;
  description?: string;
  headers: RequestHeader[];
  params: Param[];
  body: any;
  expected_status?: boolean;
  result_status?: boolean;
  result_body?: any;
  result_headers?: {
    key: string;
    value: string;
  }[];
  time_taken?: string;
  created_at: Date;
};

export type PublishedRecords = {
  id: string;
  name: string;
  test_cases: TestCase[];
};
