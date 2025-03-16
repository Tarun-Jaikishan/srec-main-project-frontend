import React, { useState } from "react";
import { FolderOpen, Plus, Trash2, Download, MoreVertical } from "lucide-react";
import { Collection } from "../types";

interface SidebarProps {
  collections: Collection[];
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
  onAddCollection: () => void;
  onDeleteCollection: (collectionId: string) => void;
  onRenameCollection: (collectionId: string, newName: string) => void;
  onAddRequest: (collectionId: string) => void;
  onDeleteRequest: (requestId: string) => void;
  onRenameRequest: (requestId: string, newName: string) => void;
  onExportCollection: (collectionId: string) => void;
  onMoveRequest: (
    requestId: string,
    fromCollectionId: string,
    toCollectionId: string
  ) => void;
}

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

interface CollectionMenuProps {
  collectionId: string;
  onAddRequest: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function CollectionMenu({
  collectionId,
  onAddRequest,
  onExport,
  onDelete,
}: CollectionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-200 rounded"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border">
          <button
            onClick={() => {
              onAddRequest();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Request
          </button>
          <button
            onClick={() => {
              onExport();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Download size={16} />
            Export Collection
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Collection
          </button>
        </div>
      )}
    </div>
  );
}

function EditableText({ value, onSave, className = "" }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editValue.trim()) {
        onSave(editValue);
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  const handleBlur = () => {
    if (editValue.trim()) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full px-1 py-0.5 border rounded ${className}`}
        autoFocus
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className={`${className} cursor-text`}
    >
      {value}
    </span>
  );
}

export function Sidebar({
  collections,
  selectedRequestId,
  onSelectRequest,
  onAddCollection,
  onDeleteCollection,
  onRenameCollection,
  onAddRequest,
  onDeleteRequest,
  onRenameRequest,
  onExportCollection,
  onMoveRequest,
}: SidebarProps) {
  const [draggedRequest, setDraggedRequest] = useState<{
    id: string;
    collectionId: string;
  } | null>(null);

  const handleDragStart = (requestId: string, collectionId: string) => {
    setDraggedRequest({ id: requestId, collectionId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (collectionId: string) => {
    if (draggedRequest && draggedRequest.collectionId !== collectionId) {
      onMoveRequest(
        draggedRequest.id,
        draggedRequest.collectionId,
        collectionId
      );
    }
    setDraggedRequest(null);
  };

  return (
    <div className="bg-gray-50 border-r border-gray-200 h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Collections</h2>
        <button
          onClick={onAddCollection}
          className="p-1 hover:bg-gray-200 rounded"
          title="Add Collection"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(collection.id)}
            className={`p-2 rounded ${
              draggedRequest && draggedRequest.collectionId !== collection.id
                ? "bg-blue-50"
                : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen size={16} />
              <EditableText
                value={collection.name}
                onSave={(newName) => onRenameCollection(collection.id, newName)}
                className="flex-1 font-medium"
              />
              <CollectionMenu
                collectionId={collection.id}
                onAddRequest={() => onAddRequest(collection.id)}
                onExport={() => onExportCollection(collection.id)}
                onDelete={() => onDeleteCollection(collection.id)}
              />
            </div>

            <div className="pl-6 space-y-1">
              {collection.requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center group"
                  draggable
                  onDragStart={() => handleDragStart(request.id, collection.id)}
                >
                  <button
                    onClick={() => onSelectRequest(request.id)}
                    className={`flex-1 text-left px-2 py-1 rounded text-sm ${
                      selectedRequestId === request.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xs font-medium text-gray-500">
                      {request.method}
                    </span>{" "}
                    <EditableText
                      value={request.name}
                      onSave={(newName) => onRenameRequest(request.id, newName)}
                    />
                  </button>
                  <button
                    onClick={() => onDeleteRequest(request.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-red-600"
                    title="Delete Request"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
