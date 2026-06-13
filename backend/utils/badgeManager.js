import User from "../models/User.js";

export const updateUserBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const badges = new Set(user.badges || []);
    
    // Default badge for all users
    badges.add("Verified Student");

    // Sales Badges
    const sales = user.completedSales || 0;
    if (sales >= 1) badges.add("First Sale");
    if (sales >= 5) badges.add("Power Seller");

    // Trust & Review Badges
    const score = user.trustScore || 0;
    const reviews = user.reviewCount || 0;
    
    if (score >= 90 && reviews >= 3) badges.add("Top Rated");
    if (sales >= 15 && score >= 95) badges.add("Campus Legend");

    const newBadgesArray = Array.from(badges);
    
    // Check if badges have changed to avoid unnecessary saves
    const currentBadgesStr = (user.badges || []).sort().join(",");
    const newBadgesStr = newBadgesArray.sort().join(",");

    if (currentBadgesStr !== newBadgesStr) {
      user.badges = newBadgesArray;
      await user.save();
      console.log(`Updated badges for user ${user._id}: ${newBadgesStr}`);
    }
  } catch (error) {
    console.error("Error updating user badges:", error);
  }
};
