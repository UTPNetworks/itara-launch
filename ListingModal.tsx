import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase'; // Adjust path to your Supabase client
import StepOne from './listing/StepOne';
import StepTwo from './listing/StepTwo';
import StepThree from './listing/StepThree';
import { toast } from 'sonner'; // Using Sonner for toast notifications

interface ListingFormData {
  title: string;
  description: string;
  category: 'Digital Assets' | 'Compute Hub' | 'Hardware' | '';
  pricingType: 'Fixed Price' | 'Bidding' | 'Subscription' | '';
  price: string;
  tags: string[];
  licenseType: string;
  compatibleFrameworks: string;
  demoUrl: string;
  deliveryMethod: 'Instant Download' | 'Manual Delivery' | 'API Access' | 'Physical Shipping' | '';
  images: { file: File; preview: string; isCover: boolean }[];
}

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: () => void;
}

export default function ListingModal({ isOpen, onClose, onListingCreated }: ListingModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    category: '',
    pricingType: '',
    price: '',
    tags: [],
    licenseType: '',
    compatibleFrameworks: '',
    demoUrl: '',
    deliveryMethod: '',
    images: [],
  });

  const handleFormChange = (field: keyof ListingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Title is required');
          return false;
        }
        if (!formData.category) {
          toast.error('Category is required');
          return false;
        }
        if (!formData.pricingType) {
          toast.error('Pricing type is required');
          return false;
        }
        if (formData.pricingType !== 'Bidding' && !formData.price) {
          toast.error('Price is required');
          return false;
        }
        if (formData.images.length === 0) {
          toast.error('At least one image is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.description.trim()) {
          toast.error('Description is required');
          return false;
        }
        if (!formData.licenseType) {
          toast.error('License type is required');
          return false;
        }
        return true;
      case 3:
        if (!formData.deliveryMethod) {
          toast.error('Delivery method is required');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error('You must be logged in to publish a listing');
      return;
    }

    setLoading(true);

    try {
      // 1. Create listing in database
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          pricing_type: formData.pricingType,
          price: formData.pricingType === 'Bidding' ? null : parseFloat(formData.price),
          tags: formData.tags,
          license_type: formData.licenseType,
          compatible_frameworks: formData.compatibleFrameworks,
          demo_url: formData.demoUrl || null,
          delivery_method: formData.deliveryMethod,
          status: 'active',
        })
        .select();

      if (listingError) throw listingError;
      if (!listing || listing.length === 0) throw new Error('Failed to create listing');

      const listingId = listing[0].id;

      // 2. Upload images to Supabase Storage
      const uploadedImages = [];
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        const fileName = `${listingId}/${Date.now()}-${image.file.name}`;
        const storagePath = `listing-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(storagePath, image.file);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('listings')
          .getPublicUrl(storagePath);

        uploadedImages.push({
          listing_id: listingId,
          image_url: publicUrl.publicUrl,
          storage_path: storagePath,
          is_cover: image.isCover,
          display_order: i,
        });
      }

      // 3. Insert image records
      if (uploadedImages.length > 0) {
        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(uploadedImages);

        if (imagesError) throw imagesError;
      }

      toast.success('Listing published successfully! 🎉');
      onClose();
      onListingCreated?.();
      setStep(1);
      setFormData({
        title: '',
        description: '',
        category: '',
        pricingType: '',
        price: '',
        tags: [],
        licenseType: '',
        compatibleFrameworks: '',
        demoUrl: '',
        deliveryMethod: '',
        images: [],
      });
    } catch (error) {
      console.error('Error publishing listing:', error);
      toast.error('Failed to publish listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 border border-purple-500/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-purple-500/20 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            List Your Item
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-4 border-b border-purple-500/10">
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all ${
                  s <= step
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-3">Step {step} of 3</p>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8">
          {step === 1 && (
            <StepOne formData={formData} onFormChange={handleFormChange} />
          )}
          {step === 2 && (
            <StepTwo formData={formData} onFormChange={handleFormChange} />
          )}
          {step === 3 && (
            <StepThree formData={formData} onFormChange={handleFormChange} />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-purple-500/20 px-8 py-6 flex justify-between gap-4">
          {step > 1 && (
            <button
              onClick={handlePrevStep}
              className="px-6 py-2 text-gray-300 border border-gray-600 rounded-lg hover:border-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-8 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-cyan-700 transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-8 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg text-white font-medium hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                '✨ Publish Listing'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
