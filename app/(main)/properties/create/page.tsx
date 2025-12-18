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
        {/* Your existing form fields */}
        {/* ... */}
        
        {/* IMPORTANT: Add required validation to area field */}
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* ... other fields ... */}
            
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
            
            {/* ... rest of the form ... */}
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