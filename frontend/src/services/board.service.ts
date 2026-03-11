import api from './api';

export const boardService = {
  getBoards: () => api.get('/boards').then((r) => r.data),

  createBoard: (data: { title: string; description?: string; color?: string }) =>
    api.post('/boards', data).then((r) => r.data),

  getBoardById: (id: string) => api.get(`/boards/${id}`).then((r) => r.data),

  updateBoard: (id: string, data: Partial<{ title: string; description: string; color: string }>) =>
    api.put(`/boards/${id}`, data).then((r) => r.data),

  deleteBoard: (id: string) => api.delete(`/boards/${id}`),

  createColumn: (boardId: string, title: string) =>
    api.post(`/boards/${boardId}/columns`, { title }).then((r) => r.data),

  updateColumn: (id: string, data: { title?: string; order?: number }) =>
    api.put(`/columns/${id}`, data).then((r) => r.data),

  deleteColumn: (id: string) => api.delete(`/columns/${id}`),

  reorderColumns: (boardId: string, columns: { id: string; order: number }[]) =>
    api.patch('/columns/reorder', { boardId, columns }).then((r) => r.data),

  createCard: (columnId: string, data: { title: string; description?: string; priority?: string; dueDate?: string }) =>
    api.post(`/columns/${columnId}/cards`, data).then((r) => r.data),

  getCard: (id: string) => api.get(`/cards/${id}`).then((r) => r.data),

  updateCard: (id: string, data: object) => api.put(`/cards/${id}`, data).then((r) => r.data),

  deleteCard: (id: string) => api.delete(`/cards/${id}`),

  moveCard: (id: string, columnId: string, order: number) =>
    api.patch(`/cards/${id}/move`, { columnId, order }).then((r) => r.data),
};
