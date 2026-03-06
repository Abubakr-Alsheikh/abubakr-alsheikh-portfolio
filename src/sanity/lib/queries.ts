import { groq } from 'next-sanity';

export const HERO_QUERY = groq`*[_type == "hero"][0]{
  _id,
  headline,
  subheadline,
  bio,
  ctaPrimary,
  ctaSecondary,
  profileImage
}`;

export const ABOUT_QUERY = groq`*[_type == "about"][0]{
  _id,
  title,
  profileImage,
  description,
  skills[]{
    _key,
    categoryTitle,
    skillList
  }
}`;
