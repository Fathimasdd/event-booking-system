import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Event from "./models/Event.js";

dotenv.config();

const cities=[
  "Hyderabad",
  "Bengaluru",
  "Mumbai",
  "Chennai",
  "Delhi",
  "Pune",
  "Kolkata",
  "Vijayawada"
];

const categories=[
  "Music",
  "Conference",
  "Sports",
  "Theatre",
  "Comedy",
  "Food & Drink",
  "Business",
  "Nightlife"
];

const venues=[
  "Sky Arena",
  "Tech Convention Center",
  "City Expo Hall",
  "Grand Cultural Theatre",
  "Riverside Grounds",
  "Metro Indoor Stadium",
  "Summit Business Center",
  "Downtown Club"
];

const titleMap={
  Music: ["Live Beats Festival", "Indie Night Sessions", "Symphony Under Stars"],
  Conference: ["AI Product Summit", "Future of SaaS Expo", "Cloud Engineering Con"],
  Sports: ["Champions League Screening", "City Marathon Expo", "Pro Kabaddi Fan Fest"],
  Theatre: ["Classic Drama Showcase", "Modern Stage Stories", "Broadway Tribute Night"],
  Comedy: ["Standup Saturday", "Laugh Riot Live", "Comic Nights Tour"],
  "Food & Drink": ["Street Food Carnival", "Coffee & Dessert Fest", "World Cuisine Fair"],
  Business: ["Startup Networking Day", "Founder Connect Forum", "Growth Marketing Live"],
  Nightlife: ["Neon After Dark", "Midnight Party Social", "DJ Pulse Weekend"]
};

const imagePool=[
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472653431158-6364773b2a56?q=80&w=1600&auto=format&fit=crop"
];

const pick=(arr, index) => arr[index % arr.length];

const run=async () => {
  await connectDB();

  await User.deleteMany({});
  await Event.deleteMany({});

  const admin=await User.create({
    name: "Admin User",
    email: "admin@smartwinnr.com",
    password: "Admin@123",
    role: "admin"
  });

  const now=new Date();
  const events=[];

  for (let i=0; i < 50; i += 1) {
    const category=pick(categories, i);
    const baseTitle=pick(titleMap[category], i);
    const city=pick(cities, i * 3);
    const venue=pick(venues, i * 5);
    const startOffsetDays=2 + i * 2;
    const startHour=10 + (i % 10);
    const durationHours=2 + (i % 4);
    const startDate=new Date(now);
    startDate.setDate(now.getDate() + startOffsetDays);
    startDate.setHours(startHour, 0, 0, 0);
    const endDate=new Date(startDate);
    endDate.setHours(startHour + durationHours);

    const totalSeats=180 + (i % 8) * 70;
    const soldSeats=Math.floor(totalSeats * ((i % 6) * 0.08));

    events.push({
      title: `${baseTitle} ${2026 + (i % 2)} - ${city}`,
      description: `Join ${baseTitle} in ${city} at ${venue}. Experience a premium ${category.toLowerCase()} event with top-tier production, curated sessions, and vibrant audiences.`,
      category,
      venue,
      city,
      imageUrl: pick(imagePool, i * 7),
      startDateTime: startDate,
      endDateTime: endDate,
      price: 25 + (i % 12) * 15,
      totalSeats,
      availableSeats: totalSeats - soldSeats,
      createdBy: admin._id
    });
  }

  await Event.insertMany(events);
  console.log("Seed completed with 50 realistic events.");
  console.log("Admin login: admin@smartwinnr.com / Admin@123");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
