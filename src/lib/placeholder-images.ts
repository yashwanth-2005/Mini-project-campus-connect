import data from './placeholder-images.json';

// Defines the data structure for a placeholder image.
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Exports the array of placeholder images from the JSON file.
// Centralizing this data makes it easier to manage.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
