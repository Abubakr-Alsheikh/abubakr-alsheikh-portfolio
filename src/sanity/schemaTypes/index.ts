import { type SchemaTypeDefinition } from 'sanity';
import { hero } from './hero';
import { about } from './about'; // 1. Import the new schema

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [hero, about], // 2. Add it to the array
};
