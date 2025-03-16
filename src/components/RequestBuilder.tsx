import { ChangeEvent, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { Send, Plus, X } from "lucide-react";
import { ApiRequest, HttpMethod, RequestHeader, QueryParam } from "../types";

type RequestBuilderProps = {
  request: ApiRequest;
  onUpdateRequest: (request: ApiRequest) => void;
  onSendRequest: () => void;
  isLoading: boolean;
};

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export default function RequestBuilder({
  request,
  onUpdateRequest,
  onSendRequest,
  isLoading,
}: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body">(
    "params"
  );

  const handleMethodChange = (method: HttpMethod) => {
    onUpdateRequest({ ...request, method });
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpdateRequest({ ...request, url: e.target.value });
  };

  const handleAddParam = () => {
    onUpdateRequest({
      ...request,
      params: [...request.params, { key: "", value: "", enabled: true }],
    });
  };

  const handleParamChange = (
    index: number,
    field: keyof QueryParam,
    value: string | boolean
  ) => {
    const newParams = [...request.params];
    newParams[index] = { ...newParams[index], [field]: value };
    onUpdateRequest({ ...request, params: newParams });
  };

  const handleRemoveParam = (index: number) => {
    const newParams = request.params.filter((_, i) => i !== index);
    onUpdateRequest({ ...request, params: newParams });
  };

  const handleAddHeader = () => {
    onUpdateRequest({
      ...request,
      headers: [...request.headers, { key: "", value: "", enabled: true }],
    });
  };

  const handleHeaderChange = (
    index: number,
    field: keyof RequestHeader,
    value: string | boolean
  ) => {
    const newHeaders = [...request.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onUpdateRequest({ ...request, headers: newHeaders });
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = request.headers.filter((_, i) => i !== index);
    onUpdateRequest({ ...request, headers: newHeaders });
  };

  const handleBodyChange = (value: string) => {
    onUpdateRequest({ ...request, body: value });
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex gap-2 mb-4">
        <select
          value={request.method}
          onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
          className="px-3 py-2 border rounded bg-white"
        >
          {HTTP_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={request.url}
          onChange={handleUrlChange}
          placeholder="Enter request URL"
          className="flex-1 px-3 py-2 border rounded"
        />

        <button
          onClick={onSendRequest}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Send size={16} /> Send
        </button>
      </div>

      <div className="border rounded">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${
              activeTab === "params" ? "border-b-2 border-blue-600" : ""
            }`}
            onClick={() => setActiveTab("params")}
          >
            Params
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "headers" ? "border-b-2 border-blue-600" : ""
            }`}
            onClick={() => setActiveTab("headers")}
          >
            Headers
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "body" ? "border-b-2 border-blue-600" : ""
            }`}
            onClick={() => setActiveTab("body")}
          >
            Body
          </button>
        </div>

        <div className="p-4">
          {activeTab === "params" && (
            <div className="space-y-2">
              {request.params.map((param, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) =>
                      handleParamChange(index, "enabled", e.target.checked)
                    }
                  />
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) =>
                      handleParamChange(index, "key", e.target.value)
                    }
                    placeholder="Parameter"
                    className="flex-1 px-3 py-1 border rounded"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) =>
                      handleParamChange(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="flex-1 px-3 py-1 border rounded"
                  />
                  <button
                    onClick={() => handleRemoveParam(index)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddParam}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} /> Add Parameter
              </button>
            </div>
          )}
          {activeTab === "headers" && (
            <div className="space-y-2">
              {request.headers.map((header, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) =>
                      handleHeaderChange(index, "enabled", e.target.checked)
                    }
                  />
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) =>
                      handleHeaderChange(index, "key", e.target.value)
                    }
                    placeholder="Header"
                    className="flex-1 px-3 py-1 border rounded"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) =>
                      handleHeaderChange(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="flex-1 px-3 py-1 border rounded"
                  />
                  <button
                    onClick={() => handleRemoveHeader(index)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddHeader}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} /> Add Header
              </button>
            </div>
          )}

          {activeTab === "body" && (
            <CodeMirror
              value={request.body}
              height="200px"
              extensions={[json()]}
              onChange={handleBodyChange}
              theme="light"
            />
          )}
        </div>
      </div>
    </div>
  );
}
