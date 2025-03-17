import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { toast } from "react-toastify";

import TestSidebar from "../components/test/TestSidebar";
import TestRequestBuilder from "../components/test/TestRequestBuilder";
import TestResponseViewer from "../components/test/TestResponseViewer";

import { TestCase, ApiResponse, PublishedRecords } from "../types";

import { axV1 } from "../helpers/axios";

export default function HomePage() {
  const location = useLocation();
  const currentPath = location.pathname;

  const [collections, setCollections] = useState<PublishedRecords[]>([]);

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
      const response = await axV1.get("/published-records", {
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
        .flatMap((c) => c.test_cases)
        .find((r) => r.id === selectedRequestId)
    : null;

  const handleAddCollection = async () => {
    const uniqueId = uuidv4();

    const newCollection: PublishedRecords = {
      id: uniqueId,
      name: "New Collection",
      test_cases: [],
    };

    setIsLoading(true);
    try {
      await axV1.post("/published-records", {
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
      await axV1.delete(`/published-records/${collectionId}`);

      setCollections(collections.filter((c) => c.id !== collectionId));
      if (
        selectedRequest?.id &&
        collections
          .find((c) => c.id === collectionId)
          ?.test_cases.some((r) => r.id === selectedRequest.id)
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
      await axV1.put("/published-records", { id: collectionId, name: newName });

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

  const handleExecuteAll = async (collectionId: string) => {
    setIsLoading(true);
    try {
      console.log("hi");
      console.log(collectionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequest = async (collectionId: string) => {
    setIsLoading(true);
    try {
      const uniqueId = uuidv4();

      const newRequest: TestCase = {
        id: uniqueId,
        test_case_name: "New Request",
        method: "GET",
        url: "",
        headers: [],
        params: [],
        body: "",
      };

      await axV1.post("/ai-test-cases", {
        id: newRequest.id,
        publish_id: collectionId,
        test_case_name: newRequest.test_case_name,
        method: newRequest.method,
      });

      setCollections(
        collections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                test_cases: [...collection.test_cases, newRequest],
              }
            : collection
        )
      );

      setSelectedRequestId(newRequest.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      await axV1.delete(`/ai-test-cases/${requestId}`);

      setCollections(
        collections.map((collection) => ({
          ...collection,
          test_cases: collection.test_cases.filter((r) => r.id !== requestId),
        }))
      );
      if (selectedRequestId === requestId) setSelectedRequestId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameRequest = async (requestId: string, newName: string) => {
    setIsLoading(true);
    try {
      await axV1.put("/ai-test-cases", {
        id: requestId,
        test_case_name: newName,
      });

      setCollections(
        collections.map((collection) => ({
          ...collection,
          test_cases: collection.test_cases.map((request) =>
            request.id === requestId
              ? { ...request, test_case_name: newName }
              : request
          ),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRequest = (updatedRequest: TestCase) => {
    console.log(updatedRequest);

    setCollections(
      collections.map((collection) => ({
        ...collection,
        test_cases: collection.test_cases.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request
        ),
      }))
    );
  };

  const handleSaveRequest = async () => {
    if (!selectedRequest) return;
    setIsLoading(true);

    try {
      let processedBody = selectedRequest.body;
      console.log(selectedRequest.body);

      if (selectedRequest.body) {
        if (typeof selectedRequest.body === "string") {
          try {
            processedBody = JSON.parse(selectedRequest.body);
          } catch (e) {
            toast.error("Invalid JSON body");
            console.error("Invalid JSON body");
            return;
          }
        }
      }

      await axV1.put("/ai-test-cases", {
        id: selectedRequest.id,
        test_case_name: selectedRequest.test_case_name,
        method: selectedRequest.method,
        description: selectedRequest.description,
        url: selectedRequest.url,
        body: processedBody,
        params: selectedRequest.params,
        headers: selectedRequest.headers,
        expected_status: selectedRequest.expected_status,
      });

      toast.success("Save Successful");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCollection = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    const exportData = {
      name: collection.name,
      test_cases: collection.test_cases,
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
          const newCollection: PublishedRecords = {
            id: Date.now().toString(),
            name: importedData.name || "Imported Collection",
            test_cases: importedData.test_cases.map((req: TestCase) => ({
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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      selectedRequest.headers
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          headers[h.key.trim()] = h.value;
        });

      const params: Record<string, string> = {};
      selectedRequest.params
        .filter((p) => p.enabled && p.key.trim())
        .forEach((p) => {
          params[p.key.trim()] = p.value;
        });

      const startTime = performance.now();
      const response = await axios({
        method: selectedRequest.method,
        url: selectedRequest.url,
        headers,
        params,
        data:
          selectedRequest.method !== "GET" && selectedRequest.body
            ? selectedRequest.body
            : undefined,
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const responseHeaders: any = response.headers || {};
      const responseData = response.data;
      const contentType = response.headers["content-type"] || "";

      const headerSize = JSON.stringify(responseHeaders).length;
      const bodySize = JSON.stringify(responseData).length;

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
      let errorResponse = {
        status: 0,
        statusText: "Request Failed",
        headers: {},
        data: { error: "Failed to send request" },
        contentType: "application/json",
        size: { headers: 0, body: 0 },
        time: 0,
      };

      if (axios.isAxiosError(error) && error.response) {
        errorResponse = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          contentType:
            error.response.headers["content-type"] || "application/json",
          size: {
            headers: JSON.stringify(error.response.headers).length,
            body: JSON.stringify(error.response.data).length,
          },
          time: 0,
        };
      }

      setResponse(errorResponse);
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
      <div className="bg-gray-100 border-b px-4 py-2 flex justify-between items-center gap-4">
        <h3 className="text-lg font-semibold">Test API</h3>
        <div className="flex items-center gap-5">
          <div className="flex gap-5">
            <Link
              to="/"
              className={`px-3 py-1.5 font-medium rounded-md transition-colors duration-200 ${
                currentPath === "/"
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-200"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              }`}
            >
              My APIs
            </Link>
            <Link
              to="/test"
              className={`px-3 py-1.5 font-medium rounded-md transition-colors duration-200 ${
                currentPath === "/test"
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-200"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              }`}
            >
              Test APIs
            </Link>
          </div>
        </div>
        {/* <div className="flex items-center gap-2">
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
            Import Test Collection
          </label>
        </div> */}
      </div>

      <div className="flex flex-1 overflow-hidden relative" id="main-container">
        <div style={{ width: sidebarWidth, flexShrink: 0 }}>
          <TestSidebar
            collections={collections}
            selectedRequestId={selectedRequestId}
            onSelectRequest={setSelectedRequestId}
            onAddCollection={handleAddCollection}
            onDeleteCollection={handleDeleteCollection}
            onRenameCollection={handleRenameCollection}
            onExecuteAll={handleExecuteAll}
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
                <TestRequestBuilder
                  request={selectedRequest}
                  onUpdateRequest={handleUpdateRequest}
                  onSendRequest={handleSendRequest}
                  onSaveRequest={handleSaveRequest}
                  isLoading={isLoading}
                />
              </div>
              <div
                className="h-2 bg-gray-200 hover:bg-blue-400 cursor-row-resize transition-colors"
                onMouseDown={() => startDragging("response")}
              />
              <div style={{ height: `${responseHeight}%` }}>
                <TestResponseViewer response={response} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a test case or create a new one to get started
            </div>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
