import { type SchemaTypeDefinition } from 'sanity'
import { hero } from './hero' // 1. Import your new hero schema

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [hero], // 2. Add it to the types array
}
