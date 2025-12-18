'use client';

import { useState, useRef } from 'react';

export default function CreatePropertyPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'APARTMENT' as const,
    category: 'RENT' as const,
    purpose: 'RESIDENTIAL' as const,
    
    // Pricing
    price: '',
    rentPrice: '',
    bookingPrice: '',
    securityDeposit: '',
    currency: 'USD',
    pricePerSqft: '',
    maintenanceFee: '',
    
    // Location
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    neighborhood: '',
    landmark: '',
    
    // Details
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaUnit: 'SQFT' as const,
    yearBuilt: '',
    parkingSpaces: '',
    floors: '',
    floorNumber: '',
    furnished: false,
    petFriendly: false,
    amenities: '',
    utilitiesIncluded: false,
    
    // Booking-specific
    minStay: '',
    maxStay: '',
    availableFrom: '',
    instantBook: false,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'STRICT' as const,
    
    // Media (will be handled by file upload)
    images: [] as string[],
    
    // Status
    status: 'DRAFT' as const,
    featured: false,
    
    // Agent/Developer (optional)
    agentId: '',
    developerId: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await fetch('/api/properties/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload images');
      }
      
      const data = await response.json();
      return data.urls || [];
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      // First, upload images if any
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        imageUrls = await uploadImages(selectedFiles);
        setUploadingImages(false);
      }
      
      // Combine uploaded images with any existing URLs
      const allImages = [...formData.images, ...imageUrls];
      
      // Format the data according to your validation schema
      const formattedData = {
        // Basic Information
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        category: formData.category,
        purpose: formData.purpose,
        
        // Pricing - convert to numbers or null
        price: formData.price ? parseFloat(formData.price) : null,
        rentPrice: formData.rentPrice ? parseFloat(formData.rentPrice) : null,
        bookingPrice: formData.bookingPrice ? parseFloat(formData.bookingPrice) : null,
        securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        currency: formData.currency,
        pricePerSqft: formData.pricePerSqft ? parseFloat(formData.pricePerSqft) : null,
        maintenanceFee: formData.maintenanceFee ? parseFloat(formData.maintenanceFee) : null,
        
        // Location
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        zipCode: formData.zipCode.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        neighborhood: formData.neighborhood.trim() || null,
        landmark: formData.landmark.trim() || null,
        
        // Property Details
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null, // Note: Your schema has this as Int
        area: parseFloat(formData.area) || 1, // Default to 1 to pass validation
        areaUnit: formData.areaUnit,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : null,
        floors: formData.floors ? parseInt(formData.floors) : null,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        furnished: formData.furnished,
        petFriendly: formData.petFriendly,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        utilitiesIncluded: formData.utilitiesIncluded,
        
        // Booking Details
        minStay: formData.minStay ? parseInt(formData.minStay) : null,
        maxStay: formData.maxStay ? parseInt(formData.maxStay) : null,
        availableFrom: formData.availableFrom || null,
        instantBook: formData.instantBook,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        cancellationPolicy: formData.cancellationPolicy,
        
        // Media
        images: allImages,
        
        // Status
        status: formData.status,
        featured: formData.featured,
        
        // Optional references
        agentId: formData.agentId.trim() || null,
        developerId: formData.developerId.trim() || null,
      };

      console.log('Submitting property data:', formattedData);

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const result = await res.json();
      console.log('API Response:', result);

      if (res.ok) {
        setMessage('Property created successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: 'APARTMENT',
          category: 'RENT',
          purpose: 'RESIDENTIAL',
          price: '',
          rentPrice: '',
          bookingPrice: '',
          securityDeposit: '',
          currency: 'USD',
          pricePerSqft: '',
          maintenanceFee: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          latitude: '',
          longitude: '',
          neighborhood: '',
          landmark: '',
          bedrooms: '',
          bathrooms: '',
          area: '',
          areaUnit: 'SQFT',
          yearBuilt: '',
          parkingSpaces: '',
          floors: '',
          floorNumber: '',
          furnished: false,
          petFriendly: false,
          amenities: '',
          utilitiesIncluded: false,
          minStay: '',
          maxStay: '',
          availableFrom: '',
          instantBook: false,
          checkInTime: '14:00',
          checkOutTime: '11:00',
          cancellationPolicy: 'STRICT',
          images: [],
          status: 'DRAFT',
          featured: false,
          agentId: '',
          developerId: '',
        });
        
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error('API Error:', result);
        setMessage(result.error || result.details || 'Failed to create property.');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      setMessage('An error occurred while creating the property.');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  // Rest of your form JSX remains the same...
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Create New Property</h1>
  
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
  
            <div>
              <label className="block mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                rows={3}
                required
              />
            </div>
          </div>
  
          {/* Property Type & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="CONDO">Condo</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="LAND">Land</option>
              </select>
            </div>
  
            <div>
              <label className="block mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="RENT">For Rent</option>
                <option value="SALE">For Sale</option>
              </select>
            </div>
  
            <div>
              <label className="block mb-2">Purpose *</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="AGRICULTURAL">Agricultural</option>
              </select>
            </div>
          </div>
  
          {/* Pricing Section */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Price (for sale)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  step="0.01"
                  placeholder="e.g., 250000"
                />
              </div>
  
              <div>
                <label className="block mb-2">Rent Price (for rent)</label>
                <input
                  type="number"
                  name="rentPrice"
                  value={formData.rentPrice}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  step="0.01"
                  placeholder="e.g., 1500"
                />
              </div>
  
              <div>
                <label className="block mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
  
            {/* Additional pricing fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block mb-2">Security Deposit</label>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  step="0.01"
                />
              </div>
  
              <div>
                <label className="block mb-2">Price per Sq Ft</label>
                <input
                  type="number"
                  name="pricePerSqft"
                  value={formData.pricePerSqft}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  step="0.01"
                />
              </div>
  
              <div>
                <label className="block mb-2">Maintenance Fee</label>
                <input
                  type="number"
                  name="maintenanceFee"
                  value={formData.maintenanceFee}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  step="0.01"
                />
              </div>
            </div>
          </div>
  
          {/* Location Section */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                  placeholder="123 Main Street"
                />
              </div>
  
              <div>
                <label className="block mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                  placeholder="New York"
                />
              </div>
  
              <div>
                <label className="block mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                  placeholder="NY"
                />
              </div>
  
              <div>
                <label className="block mb-2">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                  placeholder="United States"
                />
              </div>
   
              <div>
                <label className="block mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="10001"
                />
              </div>
  
              <div>
                <label className="block mb-2">Neighborhood</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Manhattan"
                />
              </div>
            </div>
          </div>
  
          {/* Property Details */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  min="0"
                  placeholder="3"
                />
              </div>
  
              <div>
                <label className="block mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  min="0"
                  step="0.5"
                  placeholder="2.5"
                />
              </div>
              <div>
                <label className="block mb-2">Area (sq ft) *</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                  step="0.01"
                  placeholder="1500"
                  min="1"
                />
              </div>
  
              <div>
                <label className="block mb-2">Year Built</label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="2010"
                />
              </div>
  
              <div>
                <label className="block mb-2">Parking Spaces</label>
                <input
                  type="number"
                  name="parkingSpaces"
                  value={formData.parkingSpaces}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  min="0"
                  placeholder="2"
                />
              </div>
  
              <div>
                <label className="block mb-2">Floors</label>
                <input
                  type="number"
                  name="floors"
                  value={formData.floors}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  min="0"
                  placeholder="2"
                />
              </div>
  
              <div>
                <label className="block mb-2">Floor Number</label>
                <input
                  type="number"
                  name="floorNumber"
                  value={formData.floorNumber}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  min="0"
                  placeholder="5"
                />
              </div>
            </div>
          </div>
  
          {/* Checkboxes for Features */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={formData.furnished}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span>Furnished</span>
              </label>
  
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="petFriendly"
                  checked={formData.petFriendly}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span>Pet Friendly</span>
              </label>
  
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="utilitiesIncluded"
                  checked={formData.utilitiesIncluded}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span>Utilities Included</span>
              </label>
  
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="instantBook"
                  checked={formData.instantBook}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span>Instant Book</span>
              </label>
            </div>
          </div>
  
          {/* Images - File Upload */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Images</h2>
            <div>
              <label className="block mb-2">Upload Images</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border px-3 py-2 rounded"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
              {uploadingImages && (
                <p className="mt-2 text-sm text-blue-600">Uploading images...</p>
              )}
            </div>
  
            {/* Show uploaded/preview images */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Uploaded Images:</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
  
          {/* Amenities */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div>
              <label className="block mb-2">Amenities (comma-separated)</label>
              <textarea
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                placeholder="Swimming Pool, Gym, Parking, WiFi, Air Conditioning, Heating"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate amenities with commas
              </p>
            </div>
          </div>
  
          {/* Booking Details (if rental) */}
          {formData.category === 'RENT' && (
            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2">Minimum Stay (days)</label>
                  <input
                    type="number"
                    name="minStay"
                    value={formData.minStay}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    min="1"
                  />
                </div>
  
                <div>
                  <label className="block mb-2">Maximum Stay (days)</label>
                  <input
                    type="number"
                    name="maxStay"
                    value={formData.maxStay}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                    min="1"
                  />
                </div>
  
                <div>
                  <label className="block mb-2">Available From</label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
            </div>
          )}
  
          {/* Status */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="PENDING">Pending Review</option>
                </select>
              </div>
  
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Featured Property</span>
                </label>
              </div>
            </div>
          </div>
  
          {/* Submit Button */}
          <div className="border-t pt-6">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-semibold disabled:opacity-50"
              disabled={loading || uploadingImages}
            >
              {loading ? 'Creating Property...' : 
               uploadingImages ? 'Uploading Images...' : 'Create Property'}
            </button>
          </div>
        </form>
  
        {message && (
          <div className={`mt-4 p-4 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    );
  }