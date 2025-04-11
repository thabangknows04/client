import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrganizationUserDetails } from "../../services/organizationService";
import axios from 'axios';

const BoardTab = () => {
  const [platform, setPlatform] = useState(null); // 'notion' or 'clickup'
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Simulated connection to platform
  const connectToPlatform = async (selectedPlatform) => {
    setLoading(true);
    try {
      // In a real app, you would make API calls to authenticate with the platform
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlatform(selectedPlatform);
      setIsConnected(true);
      
      // Load sample data based on platform
      if (selectedPlatform === 'notion') {
        setTasks(notionSampleTasks);
        setMembers(notionSampleMembers);
      } else {
        setTasks(clickupSampleTasks);
        setMembers(clickupSampleMembers);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Sample data for demonstration
  const notionSampleTasks = [
    { id: '1', title: 'Venue Booking', status: 'In Progress', assignee: 'John D', dueDate: '2023-12-15' },
    { id: '2', title: 'Catering Selection', status: 'To Do', assignee: 'Sarah M', dueDate: '2023-12-20' },
    { id: '3', title: 'Send Invitations', status: 'Backlog', assignee: '', dueDate: '' },
    { id: '4', title: 'Finalize Agenda', status: 'Completed', assignee: 'Alex R', dueDate: '2023-12-10' },
  ];
  
  const notionSampleMembers = ['John D', 'Sarah M', 'Alex R', 'Emma W'];
  
  const clickupSampleTasks = [
    { id: '101', name: 'Venue Booking', status: { status: 'in progress' }, assignees: [{ username: 'John D' }], due_date: '2023-12-15' },
    { id: '102', name: 'Catering Selection', status: { status: 'todo' }, assignees: [{ username: 'Sarah M' }], due_date: '2023-12-20' },
    { id: '103', name: 'Send Invitations', status: { status: 'backlog' }, assignees: [], due_date: null },
    { id: '104', name: 'Finalize Agenda', status: { status: 'complete' }, assignees: [{ username: 'Alex R' }], due_date: '2023-12-10' },
  ];
  
  const clickupSampleMembers = ['John D', 'Sarah M', 'Alex R', 'Emma W'];
  
  // Group tasks by status for board view
  const groupTasksByStatus = () => {
    if (platform === 'notion') {
      return {
        'Backlog': tasks.filter(task => task.status === 'Backlog'),
        'To Do': tasks.filter(task => task.status === 'To Do'),
        'In Progress': tasks.filter(task => task.status === 'In Progress'),
        'Completed': tasks.filter(task => task.status === 'Completed'),
      };
    } else {
      return {
        'Backlog': tasks.filter(task => task.status.status === 'backlog'),
        'To Do': tasks.filter(task => task.status.status === 'todo'),
        'In Progress': tasks.filter(task => task.status.status === 'in progress'),
        'Completed': tasks.filter(task => task.status.status === 'complete'),
      };
    }
  };
  
  const statusGroups = groupTasksByStatus();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Planner</h2>
      
      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">Connect to your preferred planning platform:</p>
          <div className="flex space-x-4">
            <button
              onClick={() => connectToPlatform('notion')}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg border ${loading ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'} border-gray-300 flex items-center justify-center space-x-2`}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="h-6 w-6" />
              <span>Connect Notion</span>
              {loading && platform === 'notion' && (
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
            <button
              onClick={() => connectToPlatform('clickup')}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg border ${loading ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'} border-gray-300 flex items-center justify-center space-x-2`}
            >
              <img src="https://clickup.com/landing/images/logo-clickup_color.svg" alt="ClickUp" className="h-6 w-6" />
              <span>Connect ClickUp</span>
              {loading && platform === 'clickup' && (
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <img 
                src={platform === 'notion' 
                  ? "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" 
                  : "https://clickup.com/landing/images/logo-clickup_color.svg"} 
                alt={platform} 
                className="h-6 w-6" 
              />
              <span className="font-medium text-gray-700">
                Connected to {platform === 'notion' ? 'Notion' : 'ClickUp'}
              </span>
            </div>
            <button 
              onClick={() => setIsConnected(false)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Disconnect
            </button>
          </div>
          
          {/* Board View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(statusGroups).map(([status, tasksInStatus]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium text-gray-700 mb-3">{status}</h3>
                <div className="space-y-3">
                  {tasksInStatus.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-800">
                        {platform === 'notion' ? task.title : task.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <span>
                          {platform === 'notion' 
                            ? task.assignee || 'Unassigned'
                            : task.assignees.length > 0 
                              ? task.assignees[0].username 
                              : 'Unassigned'}
                        </span>
                        <span>
                          {platform === 'notion' 
                            ? task.dueDate || 'No due date'
                            : task.due_date || 'No due date'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center p-2">
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
            <h3 className="text-md font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100">
                Create New Task
              </button>
              <button className="px-4 py-2 bg-green-50 text-green-600 rounded-md text-sm font-medium hover:bg-green-100">
                Import Tasks
              </button>
              <button className="px-4 py-2 bg-purple-50 text-purple-600 rounded-md text-sm font-medium hover:bg-purple-100">
                View Calendar
              </button>
              <button className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-md text-sm font-medium hover:bg-yellow-100">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardTab;