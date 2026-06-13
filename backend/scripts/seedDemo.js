import "dotenv/config";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Listing from "../models/Listing.js";
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

const DEMO_TAG = "auloop-demo-seed";
const password = "Demo@12345";

const images = {
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  cycle: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
  books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
  calculator: "https://images.unsplash.com/photo-1564473185935-58113cba1e80?auto=format&fit=crop&w=1200&q=80",
  chair: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
  kit: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80"
};

const users = [
  {
    key: "admin",
    name: "Sonu Demo Admin",
    email: "sonu.demo@anurag.edu.in",
    role: "admin",
    phone: "+91 90000 10001",
    department: "AI",
    year: "2",
    description: "AULoop admin profile for moderation demos, profile checks, and marketplace testing.",
    trustScore: 98,
    completedSales: 8,
    badges: ["Admin", DEMO_TAG]
  },
  {
    key: "sellerA",
    name: "Aarav Reddy",
    email: "aarav.demo@anurag.edu.in",
    phone: "+91 90000 10002",
    department: "CSE",
    year: "3",
    description: "Usually sells electronics, textbooks, and clean hostel essentials near the library.",
    trustScore: 91,
    completedSales: 5,
    badges: ["Fast Seller", DEMO_TAG]
  },
  {
    key: "sellerB",
    name: "Meera Nair",
    email: "meera.demo@anurag.edu.in",
    phone: "+91 90000 10003",
    department: "ECE",
    year: "2",
    description: "Lab gear and book bundles with honest condition notes and quick replies.",
    trustScore: 87,
    completedSales: 3,
    badges: ["Verified Seller", DEMO_TAG]
  },
  {
    key: "buyer",
    name: "Kabir Sharma",
    email: "kabir.demo@anurag.edu.in",
    phone: "+91 90000 10004",
    department: "IT",
    year: "1",
    description: "First-year buyer looking for useful starter gear and budget-friendly deals.",
    trustScore: 76,
    completedSales: 1,
    badges: [DEMO_TAG]
  }
];

const listingSeed = [
  {
    sellerKey: "sellerA",
    title: "Lenovo ThinkPad for coding labs",
    description: "Clean ThinkPad with SSD upgrade, charger, VS Code setup, and good battery backup. Ideal for first and second-year programming courses.",
    price: 24500,
    category: "Electronics",
    condition: "Good",
    image: images.laptop,
    campusMeetupSpots: ["Library Outside", "A to I Block"],
    tags: ["laptop", "coding", "cse"],
    qualityScore: 94
  },
  {
    sellerKey: "sellerA",
    title: "Firefox cycle with lock and bottle holder",
    description: "Daily campus commute cycle, recently serviced, smooth brakes, includes number lock and bottle holder.",
    price: 5200,
    category: "Cycles",
    condition: "Good",
    image: images.cycle,
    campusMeetupSpots: ["Gate 1 (Main Entrance)", "Parking Lot"],
    tags: ["cycle", "hostel", "commute"],
    qualityScore: 86
  },
  {
    sellerKey: "sellerB",
    title: "Engineering mathematics book bundle",
    description: "Semester 1 and 2 engineering maths books with highlighted important problems and clean notes tucked inside.",
    price: 950,
    category: "Books",
    condition: "Like New",
    image: images.books,
    campusMeetupSpots: ["Academic Block", "Library Outside"],
    tags: ["maths", "first-year", "books"],
    qualityScore: 91
  },
  {
    sellerKey: "sellerB",
    title: "Scientific calculator for exams",
    description: "Casio scientific calculator approved for regular class work. All keys work and battery is fresh.",
    price: 650,
    category: "Electronics",
    condition: "Good",
    image: images.calculator,
    campusMeetupSpots: ["Canteen (Main)", "J to O Block"],
    tags: ["calculator", "exam", "casio"],
    qualityScore: 83
  },
  {
    sellerKey: "admin",
    title: "Compact hostel study chair",
    description: "Lightweight chair for hostel rooms, comfortable for study sessions, no cracks, easy to carry.",
    price: 850,
    category: "Hostel",
    condition: "Fair",
    image: images.chair,
    campusMeetupSpots: ["Boys' Hostel Gate", "Central Quad"],
    tags: ["hostel", "chair", "room"],
    qualityScore: 78
  },
  {
    sellerKey: "sellerB",
    title: "Basic lab coat and chemistry kit",
    description: "Washed lab coat and basic kit for chemistry practicals. Best for new students who want a budget option.",
    price: 720,
    category: "Lab Gear",
    condition: "Good",
    image: images.kit,
    campusMeetupSpots: ["Academic Block", "Auditorium"],
    tags: ["lab", "chemistry", "coat"],
    qualityScore: 82,
    status: "sold"
  },
  {
    sellerKey: "admin",
    title: "Black Leather Wallet near Canteen",
    description: "I lost my black leather wallet near the main canteen around 2 PM yesterday. It has my ID card and some cash. Please let me know if you found it!",
    price: 0,
    category: "Campus Radar",
    lostFoundType: "lost",
    condition: "Fair",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80",
    campusMeetupSpots: ["Canteen (Main)"],
    tags: ["wallet", "lost", "id card"],
    qualityScore: 90
  },
  {
    sellerKey: "buyer",
    title: "Found: Blue Casio Calculator in Room 302",
    description: "Found a blue Casio calculator left behind in Room 302 after the physics lecture. Contact me to claim it.",
    price: 0,
    category: "Campus Radar",
    lostFoundType: "found",
    condition: "Fair",
    image: images.calculator,
    campusMeetupSpots: ["Academic Block"],
    tags: ["calculator", "found", "physics"],
    qualityScore: 90
  }
];

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env before seeding.");
  }
  await mongoose.connect(process.env.MONGO_URI);
};

const clearDemo = async () => {
  const demoUsers = await User.find({ email: /\.demo@anurag\.edu\.in$/ }).select("_id");
  const demoUserIds = demoUsers.map((user) => user._id);
  const demoListings = await Listing.find({ $or: [{ seller: { $in: demoUserIds } }, { tags: DEMO_TAG }] }).select("_id");
  const demoListingIds = demoListings.map((listing) => listing._id);

  await Promise.all([
    Notification.deleteMany({ $or: [{ user: { $in: demoUserIds } }, { listing: { $in: demoListingIds } }] }),
    Review.deleteMany({ $or: [{ seller: { $in: demoUserIds } }, { buyer: { $in: demoUserIds } }, { listing: { $in: demoListingIds } }] }),
    Chat.deleteMany({ $or: [{ seller: { $in: demoUserIds } }, { buyer: { $in: demoUserIds } }, { listing: { $in: demoListingIds } }] }),
    Listing.deleteMany({ _id: { $in: demoListingIds } }),
    User.deleteMany({ _id: { $in: demoUserIds } })
  ]);
};

const run = async () => {
  await connect();
  await clearDemo();

  const createdUsers = {};
  for (const item of users) {
    const created = await User.create({
      ...item,
      password,
      isVerified: true,
      avatar: {
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2563eb&color=fff&bold=true`,
        publicId: `${DEMO_TAG}/${item.key}`
      }
    });
    createdUsers[item.key] = created;
  }

  const createdListings = [];
  for (const item of listingSeed) {
    const seller = createdUsers[item.sellerKey];
    const soldTo = item.status === "sold" ? createdUsers.buyer._id : null;
    const listing = await Listing.create({
      ...item,
      seller: seller._id,
      soldTo,
      wishlistBy: [createdUsers.buyer._id],
      tags: [...item.tags, DEMO_TAG],
      images: [{ url: item.image, publicId: `${DEMO_TAG}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }]
    });
    createdListings.push(listing);
  }

  const soldListing = createdListings.find((listing) => listing.status === "sold");
  await Review.create({
    listing: soldListing._id,
    seller: soldListing.seller,
    buyer: createdUsers.buyer._id,
    rating: 5,
    comment: "Smooth handoff near the academic block and the kit was exactly as described."
  });
  await User.findByIdAndUpdate(soldListing.seller, { reviewAverage: 5, reviewCount: 1, completedSales: 4 });

  const chatListing = createdListings[0];
  const chat = await Chat.create({
    listing: chatListing._id,
    buyer: createdUsers.buyer._id,
    seller: chatListing.seller,
    messages: [
      { sender: createdUsers.buyer._id, body: "Hi, is the laptop still available?", readBy: [createdUsers.buyer._id] },
      { sender: chatListing.seller, body: "Yes, you can check it near the library today.", readBy: [chatListing.seller] },
      { sender: createdUsers.buyer._id, body: "Can you do Rs. 23000?", offer: { amount: 23000, status: "pending" }, readBy: [createdUsers.buyer._id] }
    ],
    lastMessageAt: new Date()
  });

  await Notification.create([
    {
      user: createdUsers.buyer._id,
      type: "chat",
      title: "Seller replied",
      body: "Aarav replied about the ThinkPad listing.",
      listing: chatListing._id,
      chat: chat._id
    },
    {
      user: createdUsers.admin._id,
      type: "report",
      title: "Demo moderation queue ready",
      body: "Use the seeded listings and users to test admin workflows."
    }
  ]);

  console.log("AULoop demo seed complete.");
  console.log("Demo login: sonu.demo@anurag.edu.in / Demo@12345");
  console.log("Student login: aarav.demo@anurag.edu.in / Demo@12345");
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
