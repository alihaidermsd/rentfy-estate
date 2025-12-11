import { notFound } from 'next/navigation';
import { MapPin, Bed, Bath, Square, Car, Share2, Heart, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';

export default async function PropertyPage({ params }: { params: { id: string } }) {
  
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  console.log('Fetched property data:', property); // <-- ADDED FOR DEBUGGING

  if (!property) {
    notFound();
  }

  let images = [];
  try {
    if (property.images) {
      images = JSON.parse(property.images as string);
    }
  } catch (error) {
    console.error("Failed to parse images JSON:", error);
  }

  let amenities = [];
  try {
    if (property.amenities) {
      amenities = JSON.parse(property.amenities as string);
    }
  } catch (error) {
    console.error("Failed to parse amenities JSON:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <section className="relative h-96 md:h-[500px] bg-gray-200">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${images[0] || '/images/property-placeholder.jpg'})` }}
        ></div>
        
        {/* Property Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          <Badge className="bg-blue-600 text-white">
            {property.purpose}
          </Badge>
          {property.featured && (
            <Badge className="bg-yellow-600 text-white">
              Featured
            </Badge>
          )}
          {property.verified && (
            <Badge className="bg-green-600 text-white">
              Verified
            </Badge>
          )}
          <Badge className="bg-purple-600 text-white">
            {property.type}
          </Badge>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{property.address}, {property.city}, {property.state}, {property.country}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600">
                  ${(property.price || property.rentPrice)?.toLocaleString()}
                  {property.purpose === 'RENTAL' && <span className="text-lg text-gray-600">/month</span>}
                </div>
                {property.securityDeposit && (
                  <div className="text-gray-600">
                    Security Deposit: ${property.securityDeposit.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Rating - Removed as averageRating/totalReviews are not directly on Prisma Property model */}
              {/* Key Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200">
                <div className="text-center">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bedrooms || 0}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bathrooms || 0}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <Square className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.area?.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center">
                  <Car className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.parkingSpaces || 0}</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {amenities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600">Map would be integrated here</p>
                </div>
                <div className="mt-4 space-y-2">
                  <p><strong>Address:</strong> {property.address}</p>
                  <p><strong>City:</strong> {property.city}</p>
                  <p><strong>State:</strong> {property.state}</p>
                  <p><strong>Country:</strong> {property.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
                
                {property.user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        {property.user.image ? (
                          <img 
                            src={property.user.image} 
                            alt={property.user.name || 'Agent'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {property.user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{property.user.name}</div>
                        <div className="text-sm text-gray-600">Property Owner</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Owner
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Tour
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">No owner information available</p>
                    <Button className="w-full">
                      Contact Support
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{property.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose</span>
                    <span className="font-medium">{property.purpose}</span>
                  </div>
                  {property.yearBuilt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                  )}
                  {property.furnished !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Furnished</span>
                      <span className="font-medium">{property.furnished ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {property.petFriendly !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pet Friendly</span>
                      <span className="font-medium">{property.petFriendly ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}