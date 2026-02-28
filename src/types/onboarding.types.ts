export interface OnboardingRating {
  attractionId: number;
  rating: number;
}

export interface OnboardingSubmission {
  userId: number;
  ratings: OnboardingRating[];
}

export interface OnboardingAttractionSample {
  id: number;
  name: string;
  imageUrl: string;
  category?: string;
}
