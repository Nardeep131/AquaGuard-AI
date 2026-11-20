import axios from 'axios';
import { WaterAnalysisResponse, DashboardStats } from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aquaguard_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const waterService = {
  async analyzeDrinking(data: any): Promise<WaterAnalysisResponse> {
    const res = await apiClient.post<WaterAnalysisResponse>('/water/drinking/analyze', data);
    return res.data;
  },

  async analyzeEnvironmental(data: any): Promise<WaterAnalysisResponse> {
    const res = await apiClient.post<WaterAnalysisResponse>('/water/environmental/analyze', data);
    return res.data;
  },

  async getHistory(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/water/history');
    return res.data;
  },

  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  async getStandards(): Promise<any> {
    const res = await apiClient.get<any>('/water/standards');
    return res.data;
  },

  getReportPdfUrl(sampleUid: string): string {
    return `/api/water/reports/${sampleUid}/pdf`;
  }
};
