
import data from './placeholder-images.json';

// Defines the structure for a single placeholder image object.
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Exports the array of placeholder images from the JSON file for use in the app.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
