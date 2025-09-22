import { groq } from "next-sanity";

export const HERO_QUERY = groq`*[_type == "hero"][0]{
  _id,
  headline,
  subheadline,
  bio,
  ctaPrimary,
  ctaSecondary,
  profileImage
}`;
