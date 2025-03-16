import { useState } from "react";
import { ApiResponse } from "../types";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { Copy, Check, Clock } from "lucide-react";

interface ResponseViewerProps {
  response: ApiResponse | null;
}

export default function ResponseViewer({ response }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!response) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-white">
        Send a request to see the response
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1) return "< 1ms";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const totalSize = response.size.headers + response.size.body;

  const handleCopy = async () => {
    const textToCopy =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data, null, 2);

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800";
    if (status >= 400) return "bg-red-100 text-red-800";
    if (status >= 300) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const renderContent = () => {
    if (!response.data) return null;

    if (typeof response.data === "string") {
      if (response.contentType.includes("text/html")) {
        return (
          <div className="font-mono text-sm p-4 bg-gray-50 rounded">
            <pre className="whitespace-pre-wrap break-words">
              {response.data}
            </pre>
          </div>
        );
      }
      return (
        <div className="font-mono text-sm whitespace-pre-wrap p-4 bg-gray-50 rounded">
          {response.data}
        </div>
      );
    }

    return (
      <CodeMirror
        value={JSON.stringify(response.data, null, 2)}
        height="100%"
        extensions={[json()]}
        editable={false}
        theme="light"
      />
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              response.status
            )}`}
          >
            {response.status} {response.statusText}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {formatTime(response.time)}
            </div>
            <div>
              Size: {formatSize(totalSize)} ({formatSize(response.size.headers)}{" "}
              headers + {formatSize(response.size.body)} body)
            </div>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy Response</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-4 py-2 font-medium border-b">
              Response Body
              <span className="ml-2 text-sm text-gray-500">
                {response.contentType}
              </span>
            </div>
            <div className="flex-1 overflow-auto">{renderContent()}</div>
          </div>

          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-4 py-2 font-medium border-b">
              Response Headers
            </div>
            <div className="flex-1 overflow-auto p-4">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div className="font-medium text-gray-700">{key}</div>
                  <div className="text-gray-600 break-all">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
