import React from 'react';

interface StepThreeProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
}

export default function StepThree({ formData, onFormChange }: StepThreeProps) {
  const deliveryMethods = [
    {
      id: 'Instant Download',
      label: 'Instant Download',
      description: 'Buyer gets file immediately',
      icon: '⚡',
    },
    {
      id: 'Manual Delivery',
      label: 'Manual Delivery',
      description: 'You send within 24-48hrs',
      icon: '📦',
    },
    {
      id: 'API Access',
      label: 'API Access',
      description: 'Buyer gets API endpoint',
      icon: '🔌',
    },
    {
      id: 'Physical Shipping',
      label: 'Physical Shipping',
      description: 'For hardware items',
      icon: '🚚',
    },
  ];

  const getCategoryColor = () => {
    switch (formData.category) {
      case 'Digital Assets':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'Compute Hub':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'Hardware':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      default:
        return 'from-slate-500/20 to-slate-500/20 border-slate-500/30';
    }
  };

  const getCategoryEmoji = () => {
    switch (formData.category) {
      case 'Digital Assets':
        return '💾';
      case 'Compute Hub':
        return '⚙️';
      case 'Hardware':
        return '🖥️';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-6">
      {/* Delivery Method */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">DELIVERY METHOD *</label>
        <div className="grid grid-cols-2 gap-3">
          {deliveryMethods.map(method => (
            <button
              key={method.id}
              type="button"
              onClick={() => onFormChange('deliveryMethod', method.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.deliveryMethod === method.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-2">{method.icon}</div>
              <div className="font-semibold text-white text-sm">{method.label}</div>
              <div className="text-xs text-gray-400 mt-1">{method.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Listing Preview */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">LISTING PREVIEW</label>
        <div className={`border-2 rounded-lg p-6 bg-gradient-to-br ${getCategoryColor()}`}>
          {/* Cover Image */}
          {formData.images.length > 0 && (
            <img
              src={formData.images.find((img: any) => img.isCover)?.preview}
              alt="Cover"
              className="w-full h-40 object-cover rounded-lg mb-4 border border-slate-500/30"
            />
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2">
            {formData.title || 'Untitled Listing'}
          </h3>

          {/* Category & Price */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300 flex items-center gap-1">
              <span>{getCategoryEmoji()}</span> {formData.category || 'No category selected'}
            </span>
            <span className="text-lg font-bold text-white">
              ${formData.price || '0.00'}
              {formData.pricingType === 'Subscription' && <span className="text-xs ml-1">/mo</span>}
              {formData.pricingType === 'Bidding' && <span className="text-xs ml-1">Starting Bid</span>}
            </span>
          </div>

          {/* Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.slice(0, 4).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {formData.tags.length > 4 && (
                <span className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-gray-300">
                  +{formData.tags.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Photos Count */}
          <p className="text-xs text-gray-400">
            📸 {formData.images.length} photo{formData.images.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">🛡️</div>
        <div>
          <p className="font-semibold text-emerald-300 text-sm">Protected by WhichAI Escrow</p>
          <p className="text-xs text-gray-300 mt-1">
            Payment is held securely until the buyer confirms delivery. 0% fee on your first 3 sales.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
        <div>
          <p className="text-xs text-gray-500 mb-1">LICENSE</p>
          <p className="text-sm font-semibold text-white">
            {formData.licenseType || 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">DELIVERY</p>
          <p className="text-sm font-semibold text-white">
            {formData.deliveryMethod || 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
}
