const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Rentfy database seeding...');

  try {
    // Clear existing data in correct order
    console.log('🧹 Cleaning up existing data...');
    
    // Clear all tables (in reverse order of dependencies)
    await prisma.auditLog.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.message.deleteMany();
    await prisma.review.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.property.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.developer.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Data cleared successfully');
  } catch (error) {
    console.log('⚠ Some tables may not exist yet, continuing...');
  }

  // Create system settings
  console.log('⚙️ Creating system settings...');
  await prisma.systemSetting.createMany({
    data: [
      { key: 'site_name', value: 'Rentfy', description: 'Site name', category: 'general', isPublic: true },
      { key: 'currency', value: 'USD', description: 'Default currency', category: 'payment', isPublic: true },
      { key: 'min_booking_days', value: '1', description: 'Minimum booking days', category: 'booking', isPublic: true },
    ]
  });

  // Create users
  console.log('👥 Creating users...');
  
  const password = await bcrypt.hash('password123', 12);
  
  // SUPER ADMIN
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@rentfy.com',
      name: 'Super Admin',
      password,
      role: 'SUPERADMIN',
      emailVerified: true,
      isActive: true,
      isVerified: true,
    }
  });

  // ADMIN
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rentfy.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
      isVerified: true,
    }
  });

  // PROPERTY OWNER
  const owner = await prisma.user.create({
    data: {
      email: 'owner@rentfy.com',
      name: 'Robert Johnson',
      password,
      role: 'OWNER',
      emailVerified: true,
      isActive: true,
      isVerified: true,
    }
  });

  // AGENT
  const agent = await prisma.user.create({
    data: {
      email: 'agent@rentfy.com',
      name: 'Michael Chen',
      password,
      role: 'AGENT',
      emailVerified: true,
      isActive: true,
      isVerified: true,
    }
  });

  // REGULAR USER
  const user = await prisma.user.create({
    data: {
      email: 'user@rentfy.com',
      name: 'John Doe',
      password,
      role: 'USER',
      emailVerified: true,
      isActive: true,
    }
  });

  // Create user profiles
  console.log('👤 Creating user profiles...');
  
  await prisma.userProfile.createMany({
    data: [
      {
        userId: superAdmin.id,
        phone: '+1-555-0100',
        bio: 'System Super Administrator',
        address: '1 Admin Plaza',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94107'
      },
      {
        userId: admin.id,
        phone: '+1-555-0101',
        bio: 'System Administrator',
        address: '2 Admin Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
      },
      {
        userId: owner.id,
        phone: '+1-555-0200',
        bio: 'Property investor',
        address: '123 Owner Lane',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90001'
      },
      {
        userId: agent.id,
        phone: '+1-555-0300',
        bio: 'Licensed real estate agent',
        address: '789 Agent Road',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        zipCode: '60601'
      },
      {
        userId: user.id,
        phone: '+1-555-0400',
        bio: 'Looking for a new home',
        address: '111 User Street',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        zipCode: '73301'
      }
    ]
  });

  console.log('✅ Users created successfully');

  // Create Agent Profile
  console.log('👔 Creating agent profile...');
  const agentProfile = await prisma.agent.create({
    data: {
      userId: agent.id,
      company: 'Prime Realty Group',
      licenseNumber: 'CA-LIC-123456',
      experience: 8,
      bio: 'Specializing in luxury residential properties',
      specialties: 'Luxury Homes,Residential,Property Management',
      languages: 'English,Spanish,Mandarin',
      officeAddress: '1000 Real Estate Ave, Chicago, IL',
      website: 'https://primerealty.com',
      verified: true,
      featured: true,
    }
  });

  // Create Developer Profile
  console.log('🏗️ Creating developer profile...');
  const developerProfile = await prisma.developer.create({
    data: {
      userId: agent.id,
      companyName: 'Tech Builders Inc.',
      description: 'Real estate development company',
      established: 2005,
      completedProjects: 47,
      website: 'https://techbuilders.com',
      phone: '+1-555-0500',
      email: 'info@techbuilders.com',
      address: '222 Developer Blvd, San Francisco, CA',
      verified: true,
      featured: true,
    }
  });

  console.log('✅ Profiles created successfully');

  // Create Properties
  console.log('🏠 Creating properties...');

  // RENTAL APARTMENT
  const rentalApartment = await prisma.property.create({
    data: {
      title: 'Luxury Downtown Apartment',
      description: 'Beautiful luxury apartment with amazing city views. Features modern amenities and premium finishes.',
      type: 'APARTMENT',
      category: 'RENT',
      purpose: 'RESIDENTIAL',
      slug: 'luxury-downtown-apartment',
      rentPrice: 4500,
      bookingPrice: 900,
      securityDeposit: 9000,
      currency: 'USD',
      address: '123 Skyline Avenue',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
      latitude: 40.7489,
      longitude: -73.9680,
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      yearBuilt: 2020,
      parkingSpaces: 2,
      furnished: true,
      petFriendly: true,
      amenities: JSON.stringify(['WIFI', 'AIR_CONDITIONING', 'PARKING', 'GYM', 'POOL']),
      utilitiesIncluded: true,
      minStay: 30,
      maxStay: 365,
      availableFrom: new Date('2024-03-01'),
      instantBook: true,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'STRICT',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'
      ]),
      status: 'PUBLISHED',
      featured: true,
      verified: true,
      views: 2450,
      userId: owner.id,
      agentId: agentProfile.id,
      tags: 'luxury,downtown,apartment',
      seoTitle: 'Luxury Downtown Apartment for Rent',
      seoDescription: 'Rent a luxury 3-bedroom apartment in downtown NYC',
      keywords: 'luxury apartment,NYC rental,downtown',
      publishedAt: new Date('2024-01-15'),
    }
  });

  // HOUSE FOR SALE
  const saleHouse = await prisma.property.create({
    data: {
      title: 'Modern Family Home',
      description: 'Contemporary smart home with latest technology. Energy efficient and beautifully designed.',
      type: 'HOUSE',
      category: 'SALE',
      purpose: 'RESIDENTIAL',
      slug: 'modern-family-home',
      price: 3250000,
      currency: 'USD',
      address: '789 Tech Lane',
      city: 'San Jose',
      state: 'CA',
      country: 'USA',
      zipCode: '95123',
      latitude: 34.0522,
      longitude: -118.2437,
      bedrooms: 4,
      bathrooms: 3,
      area: 5000,
      yearBuilt: 2021,
      parkingSpaces: 3,
      petFriendly: true,
      amenities: JSON.stringify(['WIFI', 'AIR_CONDITIONING', 'SECURITY', 'GARDEN']),
      utilitiesIncluded: false,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be'
      ]),
      status: 'PUBLISHED',
      featured: true,
      verified: true,
      views: 3120,
      userId: agent.id,
      developerId: developerProfile.id,
      tags: 'smart home,modern,family',
      publishedAt: new Date('2024-01-10'),
    }
  });

  console.log('✅ Properties created successfully');

  // Create availabilities
  console.log('📅 Creating availabilities...');
  
  const availabilities = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    
    availabilities.push({
      propertyId: rentalApartment.id,
      date,
      available: i % 7 !== 0,
      price: 4500,
    });
  }
  
  if (availabilities.length > 0) {
    await prisma.availability.createMany({
      data: availabilities
    });
  }

  console.log(`✅ Created ${availabilities.length} availabilities`);

  // Create booking
  console.log('📋 Creating booking...');
  
  const booking = await prisma.booking.create({
    data: {
      propertyId: rentalApartment.id,
      userId: user.id,
      bookingNumber: `BOOK-${Date.now()}`,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-30'),
      totalDays: 15,
      totalAmount: 67500,
      cleaningFee: 200,
      serviceFee: 675,
      taxAmount: 5400,
      guests: 2,
      guestName: 'John Doe',
      guestEmail: 'user@rentfy.com',
      guestPhone: '+1-555-0400',
      specialRequests: 'Early check-in if possible',
      status: 'CONFIRMED',
      paymentStatus: 'SUCCEEDED',
      paymentMethod: 'CREDIT_CARD',
    }
  });

  // Create payment
  console.log('💰 Creating payment...');
  
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      paymentNumber: `PAY-${Date.now()}`,
      amount: 67500,
      currency: 'USD',
      status: 'SUCCEEDED',
      paymentMethod: 'CREDIT_CARD',
      gateway: 'STRIPE',
      gatewayPaymentId: 'pi_test123',
    }
  });

  // Create transaction
  console.log('💳 Creating transaction...');
  
  await prisma.transaction.create({
    data: {
      transactionType: 'BOOKING',
      referenceId: booking.id,
      propertyId: rentalApartment.id,
      userId: user.id,
      agentId: agentProfile.id,
      amount: 67500,
      status: 'SUCCEEDED',
      description: 'Rental booking payment',
    }
  });

  // Create favorites
  console.log('❤️ Creating favorites...');
  
  await prisma.favorite.createMany({
    data: [
      { userId: user.id, propertyId: saleHouse.id },
      { userId: admin.id, propertyId: rentalApartment.id },
    ]
  });

  // Create inquiry
  console.log('📧 Creating inquiry...');
  
  await prisma.inquiry.create({
    data: {
      propertyId: saleHouse.id,
      userId: user.id,
      name: 'John Doe',
      email: 'user@rentfy.com',
      phone: '+1-555-0400',
      message: 'I am interested in this property. Can I schedule a viewing?',
      status: 'PENDING',
    }
  });

  // Create review
  console.log('⭐ Creating review...');
  
  await prisma.review.create({
    data: {
      propertyId: rentalApartment.id,
      userId: user.id,
      bookingId: booking.id,
      rating: 5,
      title: 'Amazing stay!',
      comment: 'The apartment was fantastic with great amenities. Would definitely book again!',
      status: 'APPROVED',
    }
  });

  // Create message
  console.log('💬 Creating message...');
  
  await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: agent.id,
      propertyId: saleHouse.id,
      subject: 'Property Inquiry',
      content: 'Hello, I am interested in the modern house. Can you provide more details?',
      isRead: false,
    }
  });

  // Create notification
  console.log('🔔 Creating notification...');
  
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: 'Booking Confirmed',
        message: 'Your booking for Luxury Downtown Apartment has been confirmed.',
        type: 'BOOKING_CONFIRMED',
        relatedId: booking.id,
        important: true,
      },
      {
        userId: owner.id,
        title: 'New Booking',
        message: 'You have a new booking for your property.',
        type: 'BOOKING_CREATED',
        relatedId: booking.id,
      },
    ]
  });

  // Create audit log
  console.log('📝 Creating audit log...');
  
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SEED_DATABASE',
      entityType: 'SYSTEM',
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(50));
  console.log('\n📊 SEEDING SUMMARY:');
  console.log('👥 Users: 5 (Super Admin, Admin, Owner, Agent, User)');
  console.log('👤 User Profiles: 5');
  console.log('👔 Agent Profile: 1');
  console.log('🏗️ Developer Profile: 1');
  console.log('🏠 Properties: 2 (Rental: 1, Sale: 1)');
  console.log(`📅 Availabilities: ${availabilities.length} dates`);
  console.log('📋 Bookings: 1');
  console.log('💰 Payments: 1');
  console.log('💳 Transactions: 1');
  console.log('❤️ Favorites: 2');
  console.log('📧 Inquiries: 1');
  console.log('⭐ Reviews: 1');
  console.log('💬 Messages: 1');
  console.log('🔔 Notifications: 2');
  console.log('⚙️ System Settings: 3');
  console.log('📝 Audit Logs: 1');
  console.log('\n🔑 TEST CREDENTIALS (Password for all: password123):');
  console.log('• Super Admin: superadmin@rentfy.com');
  console.log('• Admin: admin@rentfy.com');
  console.log('• Owner: owner@rentfy.com');
  console.log('• Agent: agent@rentfy.com');
  console.log('• User: user@rentfy.com');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Login with any test account');
  console.log('\n💡 View data in Prisma Studio:');
  console.log('   npx prisma studio');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('\n❌ SEEDING FAILED:');
    console.error('Error:', e.message);
    if (e.stack) {
      console.error('\nStack trace:', e.stack);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });