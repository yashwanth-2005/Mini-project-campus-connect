
import data from './placeholder-images.json';

// Defines the structure for a single placeholder image object.
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Exports the array of placeholder images from the JSON file.
// This allows image data to be managed in one central place.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
