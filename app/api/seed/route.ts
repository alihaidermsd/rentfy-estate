import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import cuid from "cuid";

const prisma = new PrismaClient();

// Convert array → JSON string for your schema fields (amenities, images)
const json = (data: any) => JSON.stringify(data);

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

async function main() {
  console.log("🌱 Starting Rentfy Seed...");

  // -------------------------------------
  // CLEAR DATABASE (correct order)
  // -------------------------------------
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.property.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  console.log("✔ Database cleared");

  // -------------------------------------
  // USERS
  // -------------------------------------
  const hashedPassword = await bcrypt.hash("password123", 12);

  const userTenant = await prisma.user.create({
    data: {
      email: "john.tenant@example.com",
      name: "John Tenant",
      password: hashedPassword,
      role: "USER",
    },
  });

  const userRenter = await prisma.user.create({
    data: {
      email: "sarah.renter@example.com",
      name: "Sarah Renter",
      password: hashedPassword,
      role: "USER",
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: "mike.owner@example.com",
      name: "Mike Owner",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "lisa.property@example.com",
      name: "Lisa Property",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      email: "david.agent@example.com",
      name: "David Agent",
      password: hashedPassword,
      role: "AGENT",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@rentfy.com",
      name: "Rentfy Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✔ Users created");

  // -------------------------------------
  // USER PROFILES
  // -------------------------------------
  await prisma.userProfile.createMany({
    data: [
      {
        userId: userTenant.id,
        phone: "+1234567890",
        bio: "Looking for a good apartment.",
        city: "New York",
        state: "NY",
      },
      {
        userId: userRenter.id,
        phone: "+1234567891",
        bio: "Young professional.",
        city: "Los Angeles",
        state: "CA",
      },
      {
        userId: owner1.id,
        phone: "+1234567892",
        bio: "Property investor.",
        city: "Chicago",
        state: "IL",
      },
      {
        userId: owner2.id,
        phone: "+1234567893",
        bio: "Has multiple vacation homes.",
        city: "Miami",
        state: "FL",
      },
      {
        userId: agentUser.id,
        phone: "+1234567894",
        bio: "Top-ranked agent.",
        city: "New York",
        state: "NY",
      },
      {
        userId: admin.id,
        phone: "+1234567898",
        bio: "System admin",
        city: "San Francisco",
        state: "CA",
      },
    ],
  });

  console.log("✔ User profiles created");

  // -------------------------------------
  // AGENT PROFILE
  // -------------------------------------
  const agent = await prisma.agent.create({
    data: {
      userId: agentUser.id,
      company: "Elite Properties",
      licenseNumber: "AGT-001",
      experience: 10,
      specialties: "APARTMENT,HOUSE,COMMERCIAL",
      languages: "English,Spanish,French",
      officeAddress: "123 Broker Ave, NY",
      verified: true,
      featured: true,
      totalListings: 25,
    },
  });

  console.log("✔ Agent created");

  // -------------------------------------
  // DEVELOPER PROFILE
  // -------------------------------------
  const developer = await prisma.developer.create({
    data: {
      userId: owner2.id,
      companyName: "Skyline Developers",
      established: 2012,
      completedProjects: 18,
      phone: "+198765432",
      email: "dev@skyline.com",
      address: "Miami Beach",
    },
  });

  console.log("✔ Developer created");

  // -------------------------------------
  // PROPERTIES (RENT + SALE + BOOKING TYPES)
  // -------------------------------------

  const propertyRent1 = await prisma.property.create({
    data: {
      title: "Luxury Downtown Apartment",
      slug: generateSlug("Luxury Downtown Apartment"),
      description: "Modern apartment with skyline views.",
      type: "APARTMENT",
      category: "RENT",
      purpose: "RENTAL",
      rentPrice: 3200,
      address: "123 Manhattan Ave",
      city: "New York",
      state: "NY",
      country: "USA",
      bedrooms: 2,
      bathrooms: 2,
      area: 1100,
      furnished: true,
      amenities: json(["Pool", "Gym", "Rooftop"]),
      images: json([
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      ]),
      status: "PUBLISHED",
      featured: true,
      verified: true,
      userId: owner1.id,
      agentId: agent.id,
    },
  });

  const propertyRent2 = await prisma.property.create({
    data: {
      title: "Cozy Studio Apartment",
      slug: generateSlug("Cozy Studio Apartment"),
      description: "Perfect for students or professionals.",
      type: "APARTMENT",
      category: "RENT",
      purpose: "RENTAL",
      rentPrice: 1500,
      address: "456 Brooklyn Street",
      city: "New York",
      state: "NY",
      country: "USA",
      bedrooms: 0,
      bathrooms: 1,
      area: 400,
      furnished: false,
      amenities: json(["Laundry", "Storage"]),
      images: json([
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      ]),
      status: "PUBLISHED",
      verified: true,
      userId: owner1.id,
    },
  });

  const propertySale = await prisma.property.create({
    data: {
      title: "Modern Family Home",
      slug: generateSlug("Modern Family Home"),
      description: "Large modern home with spacious backyard.",
      type: "HOUSE",
      category: "SALE",
      purpose: "BUYSELL",
      price: 950000,
      address: "555 Modern Lane",
      city: "Seattle",
      state: "WA",
      country: "USA",
      bedrooms: 4,
      bathrooms: 3,
      area: 2800,
      furnished: false,
      amenities: json(["Backyard", "Deck", "Smart Home"]),
      images: json([
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      ]),
      status: "PUBLISHED",
      verified: true,
      userId: owner2.id,
      developerId: developer.id,
    },
  });

  const propertyBooking = await prisma.property.create({
    data: {
      title: "Mountain Cabin Getaway",
      slug: generateSlug("Mountain Cabin Getaway"),
      description: "Secluded cabin with mountain views.",
      type: "HOUSE",
      category: "RENT",
      purpose: "RENTAL",
      bookingPrice: 250,
      address: "234 Mountain Road",
      city: "Aspen",
      state: "CO",
      country: "USA",
      bedrooms: 2,
      bathrooms: 1,
      area: 900,
      furnished: true,
      minStay: 2,
      maxStay: 14,
      instantBook: true,
      amenities: json(["Fireplace", "Hot Tub"]),
      images: json([
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      ]),
      status: "PUBLISHED",
      verified: true,
      userId: owner2.id,
    },
  });

  console.log("✔ Properties created");

  // -------------------------------------
  // AVAILABILITY FOR CABIN
  // -------------------------------------
  await prisma.availability.create({
    data: {
      propertyId: propertyBooking.id,
      date: new Date("2024-02-15"),
      available: false,
    },
  });

  await prisma.availability.create({
    data: {
      propertyId: propertyBooking.id,
      date: new Date("2024-02-20"),
      available: true,
      price: 250,
    },
  });

  console.log("✔ Availability created");

  // -------------------------------------
  // BOOKING
  // -------------------------------------
  const booking = await prisma.booking.create({
    data: {
      bookingNumber: cuid(),
      propertyId: propertyBooking.id,
      userId: userTenant.id,
      startDate: new Date("2024-02-15"),
      endDate: new Date("2024-02-18"),
      totalDays: 3,
      totalAmount: 750,
      guests: 2,
      guestName: "John Tenant",
      guestEmail: "john.tenant@example.com",
      status: "CONFIRMED",
      paymentStatus: "SUCCEEDED",
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: cuid(),
      bookingId: booking.id,
      amount: 750,
      paymentMethod: "CARD",
      status: "SUCCEEDED",
    },
  });

  console.log("✔ Booking + Payment created");

  // -------------------------------------
  // FAVORITES
  // -------------------------------------
  await prisma.favorite.create({
    data: {
      userId: userTenant.id,
      propertyId: propertyRent1.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: userRenter.id,
      propertyId: propertyRent2.id,
    },
  });

  console.log("✔ Favorites created");

  // -------------------------------------
  // REVIEW
  // -------------------------------------
  await prisma.review.create({
    data: {
      propertyId: propertyBooking.id,
      userId: userTenant.id,
      rating: 5,
      comment: "Amazing peaceful cabin!",
      status: "APPROVED",
    },
  });

  console.log("✔ Reviews created");

  // -------------------------------------
  // INQUIRY
  // -------------------------------------
  await prisma.inquiry.create({
    data: {
      propertyId: propertySale.id,
      userId: userTenant.id,
      name: userTenant.name || "John Tenant",
      email: userTenant.email,
      message: "What’s the school district like?",
      status: "PENDING",
    },
  });

  console.log("🎉 Seed completed successfully!");
}

export async function GET() {
  try {
    await main();
    await prisma.$disconnect();
    return NextResponse.json({ message: "Seed completed successfully!" });
  } catch (e) {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    return NextResponse.json({ message: "Seed failed!", error: e });
  }
}
