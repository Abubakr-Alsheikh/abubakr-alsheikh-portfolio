import { Image } from "sanity";

export type HeroData = {
  _id: string;
  headline: string;
  subheadline: string;
  bio: string;
  ctaPrimary: string;
  ctaSecondary: string;
  profileImage: Image;
};
