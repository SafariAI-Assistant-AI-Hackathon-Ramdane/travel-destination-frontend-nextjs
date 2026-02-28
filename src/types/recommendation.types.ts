export interface RecommendationDetails {
    name: string;
    category: string;
    rating: number;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    statistics?: any;
    image_count: number;
    image_paths: string[];
    first_image?: string | null;
    has_images: boolean;
}

export interface RecommendationItem {
    score: number;
    type: string;
    details: RecommendationDetails;
    strategy?: string | null;
    attraction_id: number;
    total_score?: number | null;
    popularity_score?: number | null;
    similarity_score?: number | null;
    weight_ncf?: number | null;
    weight_cnn?: number | null;
    is_above_threshold?: boolean | null;
}

export interface FlaskRecommendationResponse {
    recommendations: RecommendationItem[];
    parameters?: any;
    timestamp?: string;
    success?: boolean | null;
    error?: string | null;
    user_id?: number;
    recommendations_count?: number;
    user_history?: any[];
    history_count?: number;
    [key: string]: any;
}

// Legacy interface for backward compatibility
export interface RecommendedAttraction {
    id: number;
    name: string;
    attraction_url?: string;
    similarity: number;
    category?: string;
    rating?: number;
    address?: string | null;
    first_image?: string;
    image_paths?: string[];
    [key: string]: any;
}

export interface FlaskImageSearchResponse {
    success: boolean;
    results: RecommendedAttraction[];
    message: string;
    count: number;
    error?: string | null;
    timestamp?: string;
    search_info?: {
        feature_dimension: number;
        image_filename: string;
        threshold_applied: number;
        total_compared: number;
    };
}

export interface FlaskUserHistoryResponse {
    success: boolean;
    userId: number;
    history: any[];
}

export interface FlaskAttractionInfoResponse {
    success: boolean;
    attractionId: number;
    details: any;
}

export interface FlaskSystemStatusResponse {
    success: boolean;
    flask_connected: boolean;
    models_loaded: string[];
    uptime: string;
}

export interface FlaskHealthCheckResponse {
    status: string;
    details?: any;
}
