export const calculateQualityScore = ({ title, description, price, images = [], campusMeetupSpots = [], tags = [] }) => {
  let score = 20;
  if (title && title.length >= 12) score += 10;
  if (description && description.length >= 80) score += 20;
  if (Number(price) > 0) score += 10;
  if (images.length >= 1) score += 15;
  if (images.length >= 3) score += 10;
  if (campusMeetupSpots.length > 0) score += 10;
  if (tags.length >= 2) score += 5;
  return Math.min(score, 100);
};
