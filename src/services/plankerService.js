import axios from 'axios';

const PLANKER_API_URL = 'https://api.planker.com/v1'; // Replace with actual Planker API URL

let apiKey = '';
let workspaceId = '';
let boardId = '';

export const setAuth = (key, workspace, board) => {
  apiKey = key;
  workspaceId = workspace;
  boardId = board;
};

export const getCards = async () => {
  try {
    const response = await axios.get(`${PLANKER_API_URL}/boards/${boardId}/cards`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data.cards;
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
};

export const getLists = async () => {
  try {
    const response = await axios.get(`${PLANKER_API_URL}/boards/${boardId}/lists`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data.lists;
  } catch (error) {
    console.error('Error fetching lists:', error);
    throw error;
  }
};

export const getMembers = async () => {
  try {
    const response = await axios.get(`${PLANKER_API_URL}/workspaces/${workspaceId}/members`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data.members;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

export const createCard = async (cardData) => {
  try {
    const response = await axios.post(
      `${PLANKER_API_URL}/boards/${boardId}/cards`,
      cardData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating card:', error);
    throw error;
  }
};

export const updateCard = async (cardId, updates) => {
  try {
    const response = await axios.put(
      `${PLANKER_API_URL}/cards/${cardId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

export const deleteCard = async (cardId) => {
  try {
    const response = await axios.delete(
      `${PLANKER_API_URL}/cards/${cardId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};