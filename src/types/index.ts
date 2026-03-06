import { Image } from 'sanity';

export type HeroData = {
  _id: string;
  headline: string;
  subheadline: string;
  bio: string;
  ctaPrimary: string;
  ctaSecondary: string;
  profileImage: Image;
};

export type SkillCategory = {
  _key: string;
  categoryTitle: string;
  skillList: string[];
};

export type AboutData = {
  _id: string;
  title: string;
  profileImage: Image;
  description: string;
  skills: SkillCategory[];
};
