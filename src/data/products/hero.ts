import type { HeroSlide } from './types';

const SEASONAL_BLOOM_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCHU-MNzSwSUbbUPvKZvCkAJnjjr1Q74pczA_BThQ1vmUXiAhigqFmfVM6UJBm6PKYLM6lwwR3NMrcTTLt9dYI6OdgW0NKTbW4t9TA8qu-ZUJaBia7VZ6ym3L57bQlqRQnEc0s2CL8xzuJjMzuFph9CXFRr3tv-TDqJl2Ju2inAm_6q0EVgsVwlto2C5UtHP0eocusr5WBn4VLNDYxwoz6p-itwOP7TBGSVeE-XuAy14jdF2ULjhxN4qEUGFGCz-m7liS_ZWUqg-1Y';

const MIDNIGHT_GRACE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2gUwgvHVeY6k-Mj9af0voVS5A7taBgEpmlkFTl1zVrhEOYtXz_p2qiRwDkkPYfepg8PZFoARMelNrheS_Sfbk7gimiQT8hYb7mvqWroNJsZWJfRXzN70p5V1vSnIljQcRwcPvUMZoxPB4KpASwBXWz6Z2zi_jo4jghhbkeD6Wq56PRXeXB3QyWkn8VdlTpjSKyJzdX3UfhpWT_yr54S666YNUHSjPPHFKHehPl0B0oX3KWA-UD3jX489q-4DErQXTgD4RjbM-wB0';

const GOLDEN_HOUR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALi3jtLys9GQK4zuPNTLeK5fH-p66mY-cHWAwD4bB86HAtWgVdzDsyjW0ILgI6Rl7fwyDwrXxOE5IkIo6NArfueTT8wzW5iZnUQYKUNqibjc3HH3X4mmsTmQLolHRVY_SVDTN6wSCyWscb_Akr9nuBg6CWJA1nqSAU0a7-WgNmmWMgJxd_LVZBsV2OEM1uB_ZHItrtYyIHzZ9eZBHmYaDUsC9Ml09B3EDEjzl0zNHW1jrY2nyPKjI-ByOqzX1zcjT5BLmQ86srKGs';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Seasonal Bloom',
    subtitle: 'Collection',
    description:
      'Experience the elegance of hand-picked peonies delivered fresh to your doorstep.',
    imageUrl: SEASONAL_BLOOM_IMAGE,
  },
  {
    id: 2,
    title: 'Midnight Grace',
    subtitle: 'Premium',
    description:
      'A luxurious arrangement of deep purple calla lilies and dark burgundy roses.',
    imageUrl: MIDNIGHT_GRACE_IMAGE,
  },
  {
    id: 3,
    title: 'Golden Hour',
    subtitle: 'Vibrant',
    description: "Brighten someone's day with sunflowers and blue delphiniums.",
    imageUrl: GOLDEN_HOUR_IMAGE,
  },
];
