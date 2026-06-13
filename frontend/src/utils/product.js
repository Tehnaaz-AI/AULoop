const emptyImage = "https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=800&q=80";

export function productId(product) {
  return product?._id || product?.id;
}

export function productImage(product, transform = "q_auto,f_auto,w_500") {
  const img = product?.images?.[0] || product?.image;
  let url = typeof img === "object" ? img?.url : (img || emptyImage);
  if (url.includes("res.cloudinary.com") && !url.includes("upload/q_")) {
    url = url.replace("/upload/", `/upload/${transform}/`);
  }
  return url;
}

export function productVideo(product) {
  return product?.video?.url || null;
}

export function sellerName(product) {
  return product?.sellerId?.name || product?.seller?.name || "Verified student";
}

export function sellerTrust(product) {
  return product?.seller?.trustScore ?? product?.sellerId?.trustScore ?? product?.trust ?? 0;
}

export function sellerBadge(product) {
  const seller = product?.seller || product?.sellerId;
  if (seller && (seller.completedSales === 0 || !seller.completedSales) && (seller.reviewCount === 0 || !seller.reviewCount)) {
    return "New Seller";
  }
  return (seller?.badges?.[0]) || product?.badge || "Verified Student";
}

export function meetupLabel(product) {
  return product?.meetupSpot || (product?.campusMeetupSpots && product?.campusMeetupSpots[0]) || product?.meetupLocation || product?.zone || "Campus pickup";
}

export function priceLabel(value) {
  const amount = Number(value || 0);
  return `INR ${amount.toLocaleString("en-IN")}`;
}
