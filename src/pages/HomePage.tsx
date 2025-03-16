import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import Sidebar from "../components/Sidebar";
import RequestBuilder from "../components/RequestBuilder";
import ResponseViewer from "../components/ResponseViewer";

import { ApiRequest, ApiResponse, Collection } from "../types";

import { axV1 } from "../helpers/axios";

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([
    // {
    //   id: "1",
    //   name: "My Collection",
    //   api_requests: [
    //     {
    //       id: "1",
    //       name: "Example Request",
    //       method: "GET",
    //       url: "https://jsonplaceholder.typicode.com/posts/1",
    //       headers: [],
    //       params: [],
    //       body: "",
    //     },
    //   ],
    // },
  ]);

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [responseHeight, setResponseHeight] = useState(40);
  const isDraggingSidebar = useRef(false);
  const isDraggingResponse = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axV1.get("/groups", {
        params: { page: 1, perPage: -1 },
      });

      let data: any[] = response.data.data.records;

      setCollections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRequest = selectedRequestId
    ? collections
        .flatMap((c) => c.api_requests)
        .find((r) => r.id === selectedRequestId)
    : null;

  const handleAddCollection = async () => {
    const uniqueId = uuidv4();

    const newCollection: Collection = {
      id: uniqueId,
      name: "New Collection",
      api_requests: [],
    };

    setIsLoading(true);
    try {
      await axV1.post("/groups", {
        id: newCollection.id,
        name: newCollection.name,
      });
      setCollections([...collections, newCollection]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    setIsLoading(true);
    try {
      await axV1.delete(`/groups/${collectionId}`);

      setCollections(collections.filter((c) => c.id !== collectionId));
      if (
        selectedRequest?.id &&
        collections
          .find((c) => c.id === collectionId)
          ?.api_requests.some((r) => r.id === selectedRequest.id)
      ) {
        setSelectedRequestId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameCollection = async (
    collectionId: string,
    newName: string
  ) => {
    setIsLoading(true);
    try {
      await axV1.put("/groups", { id: collectionId, name: newName });

      setCollections(
        collections.map((collection) =>
          collection.id === collectionId
            ? { ...collection, name: newName }
            : collection
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequest = (collectionId: string) => {
    const uniqueId = uuidv4();

    const newRequest: ApiRequest = {
      id: uniqueId,
      name: "New Request",
      method: "GET",
      url: "",
      headers: [],
      params: [],
      body: "",
    };

    setCollections(
      collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              api_requests: [...collection.api_requests, newRequest],
            }
          : collection
      )
    );

    setSelectedRequestId(newRequest.id);
  };

  const handleDeleteRequest = (requestId: string) => {
    setCollections(
      collections.map((collection) => ({
        ...collection,
        api_requests: collection.api_requests.filter((r) => r.id !== requestId),
      }))
    );
    if (selectedRequestId === requestId) {
      setSelectedRequestId(null);
    }
  };

  const handleRenameRequest = (requestId: string, newName: string) => {
    setCollections(
      collections.map((collection) => ({
        ...collection,
        api_requests: collection.api_requests.map((request) =>
          request.id === requestId ? { ...request, name: newName } : request
        ),
      }))
    );
  };

  const handleUpdateRequest = (updatedRequest: ApiRequest) => {
    setCollections(
      collections.map((collection) => ({
        ...collection,
        api_requests: collection.api_requests.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request
        ),
      }))
    );
  };

  const handleExportCollection = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    const exportData = {
      name: collection.name,
      api_requests: collection.api_requests,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${collection.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCollection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          const newCollection: Collection = {
            id: Date.now().toString(),
            name: importedData.name || "Imported Collection",
            api_requests: importedData.api_requests.map((req: ApiRequest) => ({
              ...req,
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
            })),
          };
          setCollections([...collections, newCollection]);
        } catch (error) {
          console.error("Failed to parse imported collection:", error);
          alert("Failed to import collection. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendRequest = async () => {
    if (!selectedRequest) return;
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {};
      selectedRequest.headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          headers[h.key.trim()] = h.value;
        });

      const url = new URL(selectedRequest.url);
      selectedRequest.params
        .filter((p) => p.enabled && p.key.trim())
        .forEach((p) => {
          url.searchParams.append(p.key.trim(), p.value);
        });

      const startTime = performance.now();
      const response = await fetch(url.toString(), {
        method: selectedRequest.method,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body:
          selectedRequest.method !== "GET" && selectedRequest.body
            ? selectedRequest.body
            : undefined,
      });

      const contentType = response.headers.get("content-type") || "";
      let responseData;
      let responseText = await response.text();

      try {
        if (contentType.includes("application/json")) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = responseText;
        }
      } catch {
        responseData = responseText;
      }

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const headerSize = JSON.stringify(responseHeaders).length;
      const bodySize = responseText.length;

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        contentType,
        size: {
          headers: headerSize,
          body: bodySize,
        },
        time: responseTime,
      });
    } catch (error) {
      console.error("Request failed:", error);
      setResponse({
        status: 0,
        statusText: "Request Failed",
        headers: {},
        data: { error: "Failed to send request" },
        contentType: "application/json",
        size: { headers: 0, body: 0 },
        time: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingSidebar.current) {
      const newWidth = Math.min(
        Math.max(e.clientX, 200),
        window.innerWidth * 0.3
      );
      setSidebarWidth(newWidth);
    }
    if (isDraggingResponse.current) {
      const container = document.getElementById("main-container");
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const percentage =
          1 - (e.clientY - containerRect.top) / containerRect.height;
        const newHeight = Math.min(Math.max(percentage * 100, 20), 50);
        setResponseHeight(newHeight);
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingSidebar.current = false;
    isDraggingResponse.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const startDragging = (type: "sidebar" | "response") => {
    if (type === "sidebar") {
      isDraggingSidebar.current = true;
    } else {
      isDraggingResponse.current = true;
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center gap-4">
        <div className="flex-1 font-semibold">Test API</div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImportCollection}
            className="hidden"
            id="import-collection"
            ref={fileInputRef}
          />
          <label
            htmlFor="import-collection"
            className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded hover:bg-gray-50 cursor-pointer"
          >
            <Upload size={16} />
            Import Collection
          </label>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative" id="main-container">
        <div style={{ width: sidebarWidth, flexShrink: 0 }}>
          <Sidebar
            collections={collections}
            selectedRequestId={selectedRequestId}
            onSelectRequest={setSelectedRequestId}
            onAddCollection={handleAddCollection}
            onDeleteCollection={handleDeleteCollection}
            onRenameCollection={handleRenameCollection}
            onAddRequest={handleAddRequest}
            onDeleteRequest={handleDeleteRequest}
            onRenameRequest={handleRenameRequest}
            onExportCollection={handleExportCollection}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedRequest ? (
            <>
              <div className="flex-1 min-h-0 overflow-auto">
                <RequestBuilder
                  request={selectedRequest}
                  onUpdateRequest={handleUpdateRequest}
                  onSendRequest={handleSendRequest}
                  isLoading={isLoading}
                />
              </div>
              <div
                className="h-2 bg-gray-200 hover:bg-blue-400 cursor-row-resize transition-colors"
                onMouseDown={() => startDragging("response")}
              />
              <div style={{ height: `${responseHeight}%` }}>
                <ResponseViewer response={response} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a request or create a new one to get started
            </div>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Sending request...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
