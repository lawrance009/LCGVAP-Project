/**
 * degreeService.js
 * ---------------------------------------------------------------
 * API service layer for degree-related requests.
 * All badge logic is driven by what the server returns — no
 * client-side badge injection is permitted.
 * ---------------------------------------------------------------
 */

import api from './api';

/** Fetch all degrees (+ badges) for the currently authenticated user */
export const getMyDegrees = () => api.get('/users/me/degrees');

/** Submit a new degree for verification */
export const addDegree = (formData) =>
  api.post('/users/me/degrees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Update an unverified degree */
export const updateDegree = (degreeId, formData) =>
  api.put(`/users/me/degrees/${degreeId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/** Delete an unverified degree */
export const deleteDegree = (degreeId) =>
  api.delete(`/users/me/degrees/${degreeId}`);

/** Fetch public verified degrees for any user ID */
export const getPublicUserDegrees = (userId) =>
  api.get(`/users/${userId}/degrees`);
