import React, { useEffect, useState } from "react";
import {
  setAuthToken,
  setWorkspace,
  getTasks,
  getTaskStatuses,
  createTask,
  updateTask,
  getTeamMembers,
} from "../../services/clickupService";

const BoardTab = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [members, setMembers] = useState([]);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    assignees: [],
    due_date: null,
    status: "",
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [workspaceConfig, setWorkspaceConfig] = useState({
    token: "",
    teamId: "",
    spaceId: "",
    listId: "",
  });

  // Load initial data
  useEffect(() => {
    if (workspaceConfig.token && workspaceConfig.listId) {
      loadClickUpData();
    }
  }, [workspaceConfig]);

  const loadClickUpData = async () => {
    setLoading(true);
    try {
      const [tasksData, statusesData, membersData] = await Promise.all([
        getTasks(),
        getTaskStatuses(),
        getTeamMembers(),
      ]);

      setTasks(tasksData);
      setStatuses(statusesData);
      setMembers(membersData.map(member => member.user));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setAuthToken(workspaceConfig.token);
      setWorkspace(
        workspaceConfig.teamId,
        workspaceConfig.spaceId,
        workspaceConfig.listId
      );
      await loadClickUpData();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const createdTask = await createTask({
        name: newTask.name,
        description: newTask.description,
        assignees: newTask.assignees,
        due_date: newTask.due_date ? Date.parse(newTask.due_date) : null,
        status: newTask.status,
      });
      
      setTasks([...tasks, createdTask]);
      setNewTask({
        name: "",
        description: "",
        assignees: [],
        due_date: null,
        status: "",
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const groupTasksByStatus = () => {
    const grouped = {};
    
    // Initialize all status groups
    statuses.forEach(status => {
      grouped[status.status] = [];
    });

    // Add "unclassified" group for tasks without status
    grouped['unclassified'] = [];

    // Sort tasks into groups
    tasks.forEach(task => {
      if (task.status && grouped[task.status.status]) {
        grouped[task.status.status].push(task);
      } else {
        grouped['unclassified'].push(task);
      }
    });

    return grouped;
  };

  const statusGroups = groupTasksByStatus();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Planner</h2>
      
      {!workspaceConfig.token ? (
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">Connect ClickUp</h3>
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Token
              </label>
              <input
                type="password"
                value={workspaceConfig.token}
                onChange={(e) => setWorkspaceConfig({...workspaceConfig, token: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="pk_xxxxxxxxxxxxxxxx"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Get your token from ClickUp settings
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team ID
                </label>
                <input
                  type="text"
                  value={workspaceConfig.teamId}
                  onChange={(e) => setWorkspaceConfig({...workspaceConfig, teamId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234567"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Space ID
                </label>
                <input
                  type="text"
                  value={workspaceConfig.spaceId}
                  onChange={(e) => setWorkspaceConfig({...workspaceConfig, spaceId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="7890123"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List ID
                </label>
                <input
                  type="text"
                  value={workspaceConfig.listId}
                  onChange={(e) => setWorkspaceConfig({...workspaceConfig, listId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4567890"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : 'Connect to ClickUp'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <img 
                src="https://clickup.com/landing/images/logo-clickup_color.svg" 
                alt="ClickUp" 
                className="h-12 w-22" 
              />
              <span className="font-medium text-gray-700">
                Connected to ClickUp
              </span>
            </div>
            <button 
              onClick={() => setWorkspaceConfig({ token: "", teamId: "", spaceId: "", listId: "" })}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Disconnect
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              {/* Board View */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(statusGroups).map(([status, tasksInStatus]) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700 capitalize">{status.toLowerCase()}</h3>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {tasksInStatus.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {tasksInStatus.map(task => (
                        <div 
                          key={task.id} 
                          className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                        >
                          <h4 className="font-medium text-gray-800 mb-1">
                            {task.name}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              {task.assignees.length > 0 ? (
                                task.assignees.map(assignee => (
                                  <span 
                                    key={assignee.id} 
                                    className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                                  >
                                    {assignee.username}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400">Unassigned</span>
                              )}
                            </div>
                            <span>
                              {task.due_date ? 
                                new Date(task.due_date).toLocaleDateString() : 
                                'No due date'}
                            </span>
                          </div>
                          <select
                            value={task.status.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="mt-2 w-full text-xs border border-gray-300 rounded p-1"
                          >
                            {statuses.map(s => (
                              <option key={s.status} value={s.status}>
                                {s.status}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          setNewTask(prev => ({ ...prev, status }));
                          setShowTaskForm(true);
                        }}
                        className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-gray-700">Quick Actions</h3>
                  <button 
                    onClick={() => setShowTaskForm(true)}
                
                    className="px-4 py-2 bg-blue-900 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Create New Task
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Task Form Modal */}
          {showTaskForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Create New Task</h3>
                  <button 
                    onClick={() => setShowTaskForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={newTask.name}
                      onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter task name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter task description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignees
                    </label>
                    <select
                      multiple
                      value={newTask.assignees}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions, option => option.value);
                        setNewTask({...newTask, assignees: options});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date || ''}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newTask.status}
                      onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select status</option>
                      {statuses.map(status => (
                        <option key={status.status} value={status.status}>
                          {status.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateTask}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardTab;