import { parseCSV } from '../utils/csvLoader';

export interface Attraction {
  attraction_name: string;
  attraction_url: string;
  attraction_type: string;
  price: string;
  address: string;
  rating: string;
  review_count: string;
  images_path: string;
  images_list: string;
  [key: string]: any;
}

export interface Review {
  attraction_url: string;
  user_id: string;
  rating: string;
  review_text: string;
  [key: string]: any;
}

class AttractionService {
  private attractions: Attraction[] = [];
  private reviews: Review[] = [];
  private isLoaded = false;
  private isReviewsLoaded = false;

  async getAttractions(): Promise<Attraction[]> {
    if (!this.isLoaded) {
      await this.loadData();
    }
    return this.attractions;
  }

  private async loadData(): Promise<void> {
    try {
      const response = await fetch('/data/marrakech_attractions_clean_final.csv');
      const text = await response.text();
      this.attractions = parseCSV(text) as Attraction[];
      this.isLoaded = true;
    } catch (err) {
      console.error("Failed to load attractions data", err);
      this.attractions = [];
    }
  }

  async searchAttractions(query: string): Promise<Attraction[]> {
    if (!this.isLoaded) {
      await this.loadData();
    }
    
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return this.attractions;

    return this.attractions.filter(attr => 
      attr.attraction_name?.toLowerCase().includes(lowerQuery) ||
      attr.attraction_type?.toLowerCase().includes(lowerQuery) ||
      attr.address?.toLowerCase().includes(lowerQuery)
    );
  }

  private async loadReviews(): Promise<void> {
    try {
      const response = await fetch('/data/marrakech_reviews_clean_final.csv');
      const text = await response.text();
      this.reviews = parseCSV(text) as Review[];
      console.log("Reviews CSV loaded. Count:", this.reviews.length);
      console.log("Sample review row:", this.reviews[0]);
      this.isReviewsLoaded = true;
    } catch (err) {
      console.error("Failed to load reviews data", err);
      this.reviews = [];
    }
  }

  async getUserReviewedAttractions(userId: string): Promise<Attraction[]> {
    if (!this.isLoaded) await this.loadData();
    if (!this.isReviewsLoaded) await this.loadReviews();

    const userReviews = this.reviews.filter(r => r.user_id === userId);
    const attractionUrls = new Set(userReviews.map(r => r.attraction_url));

    return this.attractions.filter(attr => attractionUrls.has(attr.attraction_url));
  }

  async getNumericUserIdByEmail(email: string): Promise<number | null> {
    if (!this.isReviewsLoaded) await this.loadReviews();
    
    console.log("Looking for numeric ID for email:", email);
    // Be lenient with whitespace
    const review = this.reviews.find(r => r.user_id?.trim() === email.trim());
    if (review) {
      console.log("Match found in dataset:", review);
      if (review.id) {
        return parseInt(review.id);
      }
    } else {
      console.log("No match found for email in reviews. First 3 user_ids in dataset:", 
        this.reviews.slice(0, 3).map(r => r.user_id));
    }
    return null;
  }
}

export const attractionService = new AttractionService();
