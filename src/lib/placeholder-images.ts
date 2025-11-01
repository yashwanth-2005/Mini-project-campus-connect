
import data from './placeholder-images.json';

// This defines the data structure for a single placeholder image object.
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// This exports the array of placeholder images from our JSON file.
// Storing this data in one central place makes it much easier to manage
// and use consistently throughout the application.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
