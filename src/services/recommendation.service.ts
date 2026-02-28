import api from './api.config';
import {
    FlaskRecommendationResponse,
    FlaskImageSearchResponse,
    FlaskUserHistoryResponse,
    FlaskAttractionInfoResponse,
    FlaskSystemStatusResponse,
    FlaskHealthCheckResponse
} from '../types/recommendation.types';

export const recommendationService = {
    // Search by image
    searchByImage: async (imageFile: File, k?: number, threshold?: number): Promise<FlaskImageSearchResponse> => {
        const formData = new FormData();
        formData.append('image', imageFile);
        if (k !== undefined) formData.append('k', k.toString());
        if (threshold !== undefined) formData.append('threshold', threshold.toString());

        const response = await api.post<FlaskImageSearchResponse>('/api/flask/search/image', formData);
        return response.data;
    },

    // Recommendations for a specific user
    getRecommendationsForUser: async (
        userId: number, 
        k?: number, 
        useCnn?: boolean, 
        excludeRated?: boolean
    ): Promise<FlaskRecommendationResponse> => {
        const response = await api.get<FlaskRecommendationResponse>(`/api/flask/recommend/user/${userId}`, {
            params: { k, useCnn, excludeRated }
        });
        return response.data;
    },

    // Cold start recommendations
    getColdStartRecommendations: async (k?: number, strategy?: string): Promise<FlaskRecommendationResponse> => {
        const response = await api.get<FlaskRecommendationResponse>('/api/flask/recommend/cold-start', {
            params: { k, strategy }
        });
        return response.data;
    },

    // Hybrid recommendations
    getHybridRecommendations: async (
        params: {
            userId?: number;
            k?: number;
            cnnWeight?: number;
            ncfWeight?: number;
            diversity?: number;
        }
    ): Promise<FlaskRecommendationResponse> => {
        const response = await api.get<FlaskRecommendationResponse>('/api/flask/recommend/hybrid', {
            params
        });
        return response.data;
    },

    // Popular attractions
    getPopularAttractions: async (k?: number, category?: string, minReviews?: number): Promise<FlaskRecommendationResponse> => {
        const response = await api.get<FlaskRecommendationResponse>('/api/flask/recommend/popular', {
            params: { k, category, minReviews }
        });
        return response.data;
    },

    // Similar attractions
    getSimilarAttractions: async (attractionId: number, k?: number, similarityType?: string): Promise<FlaskRecommendationResponse> => {
        const response = await api.get<FlaskRecommendationResponse>(`/api/flask/recommend/similar/${attractionId}`, {
            params: { k, similarityType }
        });
        return response.data;
    },

    // User history
    getUserHistory: async (userId: number): Promise<FlaskUserHistoryResponse> => {
        const response = await api.get<FlaskUserHistoryResponse>(`/api/flask/user/history/${userId}`);
        return response.data;
    },

    // Attraction info
    getAttractionInfo: async (attractionId: number): Promise<FlaskAttractionInfoResponse> => {
        const response = await api.get<FlaskAttractionInfoResponse>(`/api/flask/attraction/info/${attractionId}`);
        return response.data;
    },

    // System status
    getSystemStatus: async (): Promise<FlaskSystemStatusResponse> => {
        const response = await api.get<FlaskSystemStatusResponse>('/api/flask/system/status');
        return response.data;
    },

    // Health check
    getHealthCheck: async (): Promise<FlaskHealthCheckResponse> => {
        const response = await api.get<FlaskHealthCheckResponse>('/api/flask/health');
        return response.data;
    }
};
