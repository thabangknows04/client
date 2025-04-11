import axios from 'axios';


const CLICKUP_API_URL = process.env.CLICKUP_API_URL;


// Store these securely in your app's configuration
let accessToken = '';
let teamId = '';
let spaceId = '';
let listId = '';

export const setAuthToken = (token) => {
  accessToken = token;
};

export const setWorkspace = (team, space, list) => {
  teamId = team;
  spaceId = space;
  listId = list;
};

export const getTasks = async () => {
  try {
    const response = await axios.get(`${CLICKUP_API_URL}/list/${listId}/task`, {
      headers: {
        Authorization: accessToken,
      },
      params: {
        archived: false,
      },
    });
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const getTaskStatuses = async () => {
  try {
    const response = await axios.get(`${CLICKUP_API_URL}/list/${listId}`, {
      headers: {
        Authorization: accessToken,
      },
    });
    return response.data.statuses;
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(
      `${CLICKUP_API_URL}/list/${listId}/task`,
      taskData,
      {
        headers: {
          Authorization: accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const response = await axios.put(
      `${CLICKUP_API_URL}/task/${taskId}`,
      updates,
      {
        headers: {
          Authorization: accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const getTeamMembers = async () => {
  try {
    const response = await axios.get(`${CLICKUP_API_URL}/team/${teamId}/member`, {
      headers: {
        Authorization: accessToken,
      },
    });
    return response.data.members;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};