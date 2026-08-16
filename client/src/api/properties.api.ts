import { apiClient } from './axios';
import { PropertyFilterParams, PropertyListResponse, PropertyDetail, PropertyListItem } from '../types/property';

export const propertiesApi = {
  getProperties: async (params?: PropertyFilterParams): Promise<PropertyListResponse> => {
    const res = await apiClient.get('/properties', { params });
    return res.data;
  },

  getFeaturedProperties: async (): Promise<PropertyListItem[]> => {
    const res = await apiClient.get('/properties/featured');
    return res.data;
  },

  getPropertyById: async (id: number | string): Promise<PropertyDetail> => {
    const res = await apiClient.get(`/properties/${id}`);
    return res.data;
  },

  getSimilarProperties: async (id: number | string): Promise<PropertyListItem[]> => {
    const res = await apiClient.get(`/properties/${id}/similar`);
    return res.data;
  },
};
