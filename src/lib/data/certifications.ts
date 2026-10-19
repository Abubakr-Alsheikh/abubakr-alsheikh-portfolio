export interface Certification {
  issuer: string;
  title: string;
  date: string;
  verifyLink?: string;
  inProgress?: boolean;
}

export interface CredentialBadge {
  title: string;
  image: string;
  /** Public verification page. A badge without one renders unlinked. */
  url?: string;
  inProgress: boolean;
}

export const certificationsData: Certification[] = [
  {
    issuer: "AWS",
    title: "Solutions Architect - Associate",
    date: "",
    inProgress: true,
  },
  {
    issuer: "Meta",
    title: "Android Developer Specialization",
    date: "Oct 2026",
    verifyLink: "https://coursera.org/verify/specialization/B1OVI6VV69TQ",
  },
  {
    issuer: "Meta",
    title: "Database Engineer Specialization",
    date: "Oct 2025",
    verifyLink: "https://coursera.org/verify/professional-cert/DVOE153YB0WY",
  },
  {
    issuer: "Meta",
    title: "Back-End Developer Specialization",
    date: "Feb 2025",
    verifyLink: "https://coursera.org/verify/professional-cert/27BFUTT4GQNN",
  },
  {
    issuer: "Meta",
    title: "Front-End Developer Specialization",
    date: "Jul 2024",
    verifyLink: "https://coursera.org/verify/professional-cert/V4MF3W9N5V5X",
  },
  {
    issuer: "EBTECH",
    title: "Odoo Developer",
    date: "Dec 2024",
    verifyLink:
      "https://www.linkedin.com/in/abubakr-alsheikh/overlay/Certifications/498554917/treasury/?profileId=ACoAAD7baTAB-wX_tWc6CAAmrOVqDYHWJu_Zmbs&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_certifications_details%3BR9BKyY7ERxm0bzthbwR37A%3D%3D",
  },
  {
    issuer: "U-Michigan",
    title: "Django for Everybody",
    date: "Jan 2024",
    verifyLink: "https://coursera.org/verify/specialization/DC49ZLKAM5TQ",
  },
  {
    issuer: "U-Michigan",
    title: "Python for Everybody",
    date: "Sep 2023",
    verifyLink: "https://coursera.org/verify/specialization/QTNT2MHPT8M7",
  },
  {
    issuer: "U-Michigan",
    title: "Web Applications for Everybody",
    date: "Aug 2023",
    verifyLink: "https://coursera.org/verify/specialization/F7RBLWC5AGB3",
  },
  {
    issuer: "U-Michigan",
    title: "Web Design for Everyone",
    date: "Jul 2023",
    verifyLink: "https://coursera.org/verify/specialization/UERU9T5YRQWS",
  },
];

export const badgesData: CredentialBadge[] = [
  {
    title: "Front-End Developer",
    image: "/credly_badges/Meta Front-End Developer Certificate.png",
    url: "https://www.credly.com/badges/d480aea5-53c3-4c29-98ba-03701f10b95e/public_url",
    inProgress: false,
  },
  {
    title: "Back-End Developer",
    image: "/credly_badges/Meta Back-End Developer Certificate.png",
    url: "https://www.credly.com/badges/f992900c-003e-43ee-947e-e52bf1c478c0/public_url",
    inProgress: false,
  },
  {
    title: "Database Engineer",
    image: "/credly_badges/Meta Database Engineer Professional Certificate.png",
    url: "https://www.credly.com/badges/c189dbae-f27a-43a1-8b07-1004c78f34c5/public_url",
    inProgress: false,
  },
  {
    title: "Full-Stack Engineer",
    image: "/credly_badges/Meta Full-Stack Engineer Certificate.png",
    url: "https://www.credly.com/badges/2238500d-5f85-4b09-99e1-c19b92fab403/public_url",
    inProgress: false,
  },
  {
    title: "Android Developer",
    image: "/credly_badges/Meta Android Developer Certificate.png",
    url: "https://www.credly.com/badges/16e74307-bb6e-4d32-bf62-75a479ba6f13/public_url",
    inProgress: false,
  },
  {
    // Earned for completing the Front-End, Back-End, Database and Android
    // programs, but never issued on Credly, so there is no public URL to link.
    title: "Generalist Software Engineer",
    image: "/credly_badges/Meta Generalist Software Engineer Certificate.png",
    inProgress: false,
  },
];
