import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import User from './models/User.js';
import Listing from './models/Listing.js';

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();

const usersData = [
  {
    name: "Alex Johnson",
    email: "alex.mentor@anurag.edu.in",
    password: "password123",
    department: "Computer Science",
    year: "4th Year",
    trustScore: 98,
    completedSales: 25,
    avatar: { url: "https://randomuser.me/api/portraits/men/32.jpg" }
  },
  {
    name: "Samantha Lee",
    email: "sam.mentor@anurag.edu.in",
    password: "password123",
    department: "Electronics",
    year: "3rd Year",
    trustScore: 95,
    completedSales: 18,
    avatar: { url: "https://randomuser.me/api/portraits/women/44.jpg" }
  },
  {
    name: "David Chen",
    email: "david.mentor@anurag.edu.in",
    password: "password123",
    department: "Mechanical",
    year: "2nd Year",
    trustScore: 91,
    completedSales: 10,
    avatar: { url: "https://randomuser.me/api/portraits/men/85.jpg" }
  }
];

const listingsData = [
  {
    title: "Engineering Mathematics 3rd Ed",
    description: "Barely used textbook for second-year math courses. No highlights or markings inside.",
    price: 450,
    category: "Books",
    condition: "Like New",
    campusMeetupSpots: ["Library", "Canteen"],
    images: [{ url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80", publicId: "dummy1" }]
  },
  {
    title: "Hercules Roadeo Cycle",
    description: "Selling my trusty cycle. Used it for a year to commute from hostel to classes. Good condition, recently serviced.",
    price: 2500,
    category: "Cycles",
    condition: "Good",
    campusMeetupSpots: ["Main Gate"],
    images: [{ url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80", publicId: "dummy2" }]
  },
  {
    title: "Scientific Calculator FX-991EX",
    description: "Casio scientific calculator, essential for exams. Works perfectly.",
    price: 800,
    category: "Electronics",
    condition: "Good",
    campusMeetupSpots: ["Block 1", "Block 2"],
    images: [{ url: "https://images.unsplash.com/photo-1574607383077-47ddc2dc51c4?auto=format&fit=crop&w=800&q=80", publicId: "dummy3" }]
  },
  {
    title: "Hostel Mattress & Bucket Set",
    description: "Graduating this semester. Selling my mattress, bucket, and mug. Cleaned and ready.",
    price: 500,
    category: "Hostel",
    condition: "Fair",
    campusMeetupSpots: ["Boys Hostel C"],
    images: [{ url: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80", publicId: "dummy4" }]
  },
  {
    title: "Found: Boat Airdopes",
    description: "Found a pair of black boat airdopes near the sports ground.",
    price: 0,
    category: "Campus Radar",
    lostFoundType: "found",
    condition: "Good",
    campusMeetupSpots: ["Sports Ground"],
    images: [{ url: "https://images.unsplash.com/photo-1608156639585-b3a032822599?auto=format&fit=crop&w=800&q=80", publicId: "dummy5" }]
  },
  {
    title: "Airpods Pro Gen 2",
    description: "Selling Airpods Pro Gen 2. Excellent condition with noise cancellation working flawlessly.",
    price: 15000,
    category: "Electronics",
    condition: "Like New",
    campusMeetupSpots: ["Cafe"],
    images: [{ url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80", publicId: "dummy6" }],
    video: { url: "https://www.w3schools.com/html/mov_bbb.mp4", publicId: "vid1" }
  },
  {
    title: "Lab Coat and Goggles",
    description: "Essential for chemistry lab. Washed and sanitized.",
    price: 250,
    category: "Lab Gear",
    condition: "Good",
    campusMeetupSpots: ["Chemistry Lab"],
    images: [{ url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", publicId: "dummy7" }]
  },
  {
    title: "Basketball Size 7",
    description: "Spalding indoor/outdoor basketball. Used a few times.",
    price: 600,
    category: "Sports",
    condition: "Like New",
    campusMeetupSpots: ["Sports Complex"],
    images: [{ url: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80", publicId: "dummy8" }]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (let u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = new User(u);
        await user.save();
        console.log(`User created: ${user.email}`);
      } else {
        console.log(`User exists: ${user.email}`);
      }

      // Add a couple of listings for each user
      for (let i = 0; i < 3; i++) {
        const lData = listingsData.pop();
        if (lData) {
          lData.seller = user._id;
          const listing = new Listing(lData);
          await listing.save();
          console.log(`Listing created: ${listing.title}`);
        }
      }
    }
    
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
