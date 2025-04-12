import React, { useEffect, useState } from "react";
import "./BoardTab.css"; // Create this CSS file for styling

const BoardTab = ({ eventData, boardId }) => {
  const [board, setBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("kanban");
  const [items, setItems] = useState([]);

  // Monday.com API token - IMPORTANT: In production, use environment variables
  const MONDAY_API_TOKEN =
    "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5OTEzNDM0MywiYWFpIjoxMSwidWlkIjo3NDgxNjI1NCwiaWFkIjoiMjAyNS0wNC0xMlQxMzoxNDo0NC4xMDNaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjkwNDU3MjQsInJnbiI6ImV1YzEifQ.woKmOAsMM60MGYsDNN6sRfWiReaMFEMTeSW_ums8YbM";

  // Load board when component mounts or when boardId changes
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

      `;
  
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
  
      // Set board structure and items separately
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
    // Simple status color mapping - customize as needed
    const statusColors = {
      done: "#00c875",
      "working on it": "#fdab3d",
      stuck: "#e2445b",
      "": "#c4c4c4",
    };
    return statusColors[statusText.toLowerCase()] || "#c4c4c4";
  };

  const renderKanbanView = () => {
    if (!board || !items.length) return null;

    // Group items by their group (column in Kanban)
    const groupedItems = {};
    board.groups.forEach((group) => {
      groupedItems[group.id] = items.filter(
        (item) => item.group.id === group.id
      );
    });

    return (
        <div className="board-tab">
        <h2>{board?.name}</h2>
  
        {board?.groups && (
          <div className="kanban-container">
            {board.groups.map((group) => (
              <div
                key={group.id}
                className="kanban-column"
                style={{ borderTop: `3px solid ${group.color}` }}
              >
                <h3 className="kanban-column-title">{group.title}</h3>
                <div className="kanban-cards">
                  {groupedItems[group.id]?.map((item) => (
                    <div key={item.id} className="kanban-card">
                      <h4>{item.name}</h4>
                      <div className="card-details">
                        <span
                          className="status-indicator"
                          style={{
                            backgroundColor: getStatusColor(getColumnValue(item, 'project_status')),
                          }}
                        />
                        <p>{getColumnValue(item, 'project_status')}</p>
                        <p>Due: {getColumnValue(item, 'date')}</p>
  
                        {item.subitems && item.subitems.length > 0 && (
                          <p className="subtasks">
                            {item.subitems.length} subtasks
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
   
    );
  };

  const renderTableView = () => {
    if (!board || !items.length) return null;

    // Find important columns to display (limit to 5 for demo)
    const displayColumns = board.columns
      .filter((col) => ["name", "status", "date", "text"].includes(col.type))
      .slice(0, 5);

    return (
      <table className="table-view">
        <thead>
          <tr>
            <th>Name</th>
            {displayColumns.map((col) => (
              <th key={col.id}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              {displayColumns.map((col) => {
                const columnValue = item.column_values.find(
                  (cv) => cv.id === col.id
                );
                return <td key={col.id}>{columnValue?.text || "-"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
    return <div>No event data provided</div>;
  }

  if (isLoading) {
    return <div className="loading-spinner">Loading board...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading board: {error}</div>;
  }

  return (
    <div className="board-tab">
      <div className="board-header">
        <h2>{eventData.name}</h2>
        <div className="view-switcher">
          <button
            className={activeView === "kanban" ? "active" : ""}
            onClick={() => setActiveView("kanban")}
          >
            Kanban
          </button>
          <button
            className={activeView === "table" ? "active" : ""}
            onClick={() => setActiveView("table")}
          >
            Table
          </button>
        </div>
      </div>

      {board ? (
        <div className="board-content p-4 bg-white shadow rounded-md">
        <div className="board-info mb-4">
          <p className="text-gray-700 text-sm mb-1">
            {board.description || "No description"}
          </p>
          <p className="text-gray-500 text-xs">
            {items?.length || 0} items • {board.groups?.length || 0} groups
          </p>
        </div>
      
        {renderActiveView()}
      </div>
      
      ) : (
        <p>Board not loaded</p>
      )}
    </div>
  );
};

export default BoardTab;
