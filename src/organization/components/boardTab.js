import React, { useEffect, useState } from "react";
import "./BoardTab.css"; // We'll create this CSS file

const BoardTab = ({ eventData, boardId }) => {
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("kanban");
  const [items, setItems] = useState([]);

  // Monday.com API token - IMPORTANT: In production, use environment variables
  const MONDAY_API_TOKEN =
    "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5OTEzNDM0MywiYWFpIjoxMSwidWlkIjo3NDgxNjI1NCwiaWFkIjoiMjAyNS0wNC0xMlQxMzoxNDo0NC4xMDNaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjkwNDU3MjQsInJnbiI6ImV1YzEifQ.woKmOAsMM60MGYsDNN6sRfWiReaMFEMTeSW_ums8YbM";

  useEffect(() => {
    if (boardId) {
      loadBoard(boardId);
    }
  }, [boardId]);

  const loadBoard = async (boardId) => {
    setIsLoading(true);
    setError(null);

    try {
      const boardQuery = `
      query {
boards(ids: ${boardId}) {
  id
  name
  description
  groups {
    id
    title
  }
  columns {
    id
    title
    type
  }
  items_page(limit: 25) {
    items {
      id
      name
      group {
        id
      }
      column_values {
        id
        text
        value
        type
      }
    }
  }
}
}

    `; // Your existing query

      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          Authorization: MONDAY_API_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: boardQuery }),
      });

      const result = await response.json();

      if (!response.ok || result.errors) {
        throw new Error(result.errors?.[0]?.message || "Failed to load board");
      }

      const boardData = result.data.boards[0];
      setBoard({
        id: boardData.id,
        name: boardData.name,
        description: boardData.description,
        groups: boardData.groups,
        columns: boardData.columns,
      });
      setItems(boardData.items_page.items);
    } catch (err) {
      console.error("Error loading board:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getColumnValue = (item, columnTitle) => {
    const column = item.column_values.find((col) => col.title === columnTitle);
    return column ? column.text : "";
  };

  const getStatusColor = (statusText) => {
    const statusColors = {
      done: "#00c875",
      "working on it": "#fdab3d",
      stuck: "#e2445b",
      "": "#c4c4c4",
    };
    return statusColors[statusText.toLowerCase()] || "#c4c4c4";
  };

  const renderKanbanView = () => {
    if (!board || !items.length)
      return (
        <div className="empty-state">
          <p>No items found in this board</p>
        </div>
      );

    const groupedItems = {};
    board.groups.forEach((group) => {
      groupedItems[group.id] = items.filter(
        (item) => item.group.id === group.id
      );
    });

    return (
      <div className="kanban-grid">
        {board.groups.map((group) => (
          <div key={group.id} className="kanban-column">
            <div className="column-header">
              <h3 className="column-title">{group.title}</h3>
              <span className="item-count">
                {groupedItems[group.id]?.length || 0}
              </span>
            </div>
            <div className="kanban-cards">
              {groupedItems[group.id]?.map((item) => (
                <div key={item.id} className="kanban-card">
                  <h4 className="card-title">{item.name}</h4>
                  <div className="card-meta">
                    <div className="status-badge">
                      <span
                        className="status-dot"
                        style={{
                          backgroundColor: getStatusColor(
                            getColumnValue(item, "project_status")
                          ),
                        }}
                      />
                      <span>
                        {getColumnValue(item, "project_status") || "No status"}
                      </span>
                    </div>
                    {getColumnValue(item, "date") && (
                      <div className="due-date">
                        <svg className="calendar-icon" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                        </svg>
                        <span>{getColumnValue(item, "date")}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    if (!board || !items.length)
      return (
        <div className="empty-state">
          <p>No items found in this board</p>
        </div>
      );

    const displayColumns = board.columns
      .filter((col) => ["name", "status", "date", "text"].includes(col.type))
      .slice(0, 5);

    return (
      <div className="table-container">
        <table className="board-table">
          <thead>
            <tr>
              <th>Task</th>
              {displayColumns.map((col) => (
                <th key={col.id}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="task-cell">
                  <div className="task-name">{item.name}</div>
                </td>
                {displayColumns.map((col) => {
                  const columnValue = item.column_values.find(
                    (cv) => cv.id === col.id
                  );
                  const value = columnValue?.text || "-";
                  return (
                    <td key={col.id}>
                      {col.type === "status" ? (
                        <div className="status-cell">
                          <span
                            className="status-dot"
                            style={{ backgroundColor: getStatusColor(value) }}
                          />
                          {value}
                        </div>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "kanban":
        return renderKanbanView();
      case "table":
        return renderTableView();
      default:
        return <p>View type not supported</p>;
    }
  };

  if (!eventData) {
    return <div className="empty-state">No event data provided</div>;
  }

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading board data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">!</div>
        <p>Error loading board: {error}</p>
        <button
          className="retry-button"
          onClick={() => boardId && loadBoard(boardId)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="board-container">
      <div className="board-header">
        <div className="header-left">
          <h2 className="board-name">{eventData.name}</h2>
          {board?.description && (
            <p className="board-description">{board.description}</p>
          )}
        </div>
        <div className="header-right">
          <div className="view-tabs">
            <button
              className={`view-tab ${activeView === "kanban" ? "active" : ""}`}
              onClick={() => setActiveView("kanban")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm8 14H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z" />
              </svg>
              Kanban
            </button>
            <button
              className={`view-tab ${activeView === "table" ? "active" : ""}`}
              onClick={() => setActiveView("table")}
            >
              <svg className="tab-icon" viewBox="0 0 24 24">
                <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm8 2H5V5h6v2zm2 0h6V5h-6v2zm-2 4H5V9h6v2zm2 0h6V9h-6v2zm-2 4H5v-2h6v2zm2 0h6v-2h-6v2zm-2 4H5v-2h6v2zm2 0h6v-2h-6v2z" />
              </svg>
              Table
            </button>
          </div>
          <div className="board-stats">
            <span className="stat-item">
              <strong>{board?.groups?.length || 0}</strong> Groups
            </span>
            <span className="stat-item">
              <strong>{items.length}</strong> Items
            </span>
          </div>
        </div>
      </div>

      <div className="board-content">{renderActiveView()}</div>
    </div>
  );
};

export default BoardTab;
