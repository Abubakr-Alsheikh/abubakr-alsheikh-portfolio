/**
 * The contact section's content. The copy lives here, not in Horizon.tsx.
 *
 * `intro` names no framework on purpose, and says so plainly: the work is
 * whatever the problem needs, and the stack is the client's to choose. The
 * hero states the approach rather than the tools (see hero.ts), a contact
 * line advertising two specific ones contradicts it, and a visitor arriving
 * with something outside that pair should not read the page as a no.
 */
export const contactData = {
  email: "AbubakrAlsheikh@outlook.com",
  /** The real place. The hero clock runs on the same city. */
  location: "Aleppo, Syria // Remote",
  headline: { lead: "Initiate", trail: "Connection." },
  intro:
    "The descent is complete. The architecture is reviewed. Bring the problem and whatever it already runs on: the tools change from one project to the next, the engineering does not. Design, build, take over or repair, transmit your payload.",
  resumeLink: "/Abubakr_Alsheikh_Resume.pdf",
  /**
   * Chat apps. Each link only opens a conversation: the WhatsApp link carries
   * no `?text=`, so nothing is prefilled or sent on the visitor's behalf.
   */
  messengers: [
    {
      name: "TELEGRAM",
      handle: "@AbubakrAlsheikh",
      url: "https://t.me/AbubakrAlsheikh",
      icon: "telegram",
    },
    {
      name: "WHATSAPP",
      handle: "+963 980 235 562",
      url: "https://wa.me/963980235562",
      icon: "whatsapp",
    },
  ],
  socials: [
    {
      name: "GITHUB",
      url: "https://github.com/Abubakr-Alsheikh",
      icon: "github",
    },
    {
      name: "LINKEDIN",
      url: "https://linkedin.com/in/abubakr-alsheikh",
      icon: "linkedin",
    },
  ],
};
