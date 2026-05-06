import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  pricing_type: string;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
  cover_image?: string;
  description?: string;
}

interface MyListingsDashboardProps {
  onRefresh?: () => void;
}

export default function MyListingsDashboard({ onRefresh }: MyListingsDashboardProps) {
  const { user } = useUser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(
          `
          id,
          title,
          category,
          price,
          pricing_type,
          status,
          created_at,
          updated_at,
          description,
          listing_images!inner(image_url, is_cover)
        `
        )
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map data and add cover images
      const mappedListings = (data || []).map((listing: any) => ({
        ...listing,
        cover_image: listing.listing_images?.find((img: any) => img.is_cover)?.image_url
          || listing.listing_images?.[0]?.image_url,
      }));

      setListings(mappedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) throw error;

      // Update local state
      setListings(listings.map(l =>
        l.id === listingId ? { ...l, status: newStatus as any } : l
      ));

      toast.success(`Listing ${newStatus === 'active' ? 'reactivated' : 'paused'} ✓`);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;

    try {
      // First delete associated images from storage
      const { data: images, error: imagesError } = await supabase
        .from('listing_images')
        .select('storage_path')
        .eq('listing_id', listingId);

      if (!imagesError && images) {
        for (const img of images) {
          await supabase.storage.from('listings').remove([img.storage_path]);
        }
      }

      // Then delete listing record (images table will cascade delete)
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (deleteError) throw deleteError;

      setListings(listings.filter(l => l.id !== listingId));
      toast.success('Listing deleted');
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const filteredListings = filter === 'all'
    ? listings
    : listings.filter(l => l.status === filter);

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    paused: listings.filter(l => l.status === 'paused').length,
    archived: listings.filter(l => l.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Active', value: stats.active, color: 'text-emerald-400' },
          { label: 'Paused', value: stats.paused, color: 'text-yellow-400' },
          { label: 'Archived', value: stats.archived, color: 'text-gray-400' },
        ].map(stat => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-4"
          >
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color || 'text-white'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {(['all', 'active', 'paused', 'archived'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              filter === f
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">
            {filter === 'all'
              ? "You haven't posted any listings yet"
              : `No ${filter} listings`}
          </p>
          <p className="text-sm text-gray-500">Start by creating your first listing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map(listing => (
            <div
              key={listing.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all"
            >
              <div className="p-4 flex gap-4">
                {/* Cover Image */}
                {listing.cover_image && (
                  <img
                    src={listing.cover_image}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-600"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white truncate">{listing.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        listing.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : listing.status === 'paused'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}
                    >
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{listing.category}</span>
                    <span>
                      ${listing.price || '0.00'}
                      {listing.pricing_type === 'Subscription' && '/mo'}
                    </span>
                    <span className="text-xs">
                      Created {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {listing.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                  {listing.status === 'active' ? (
                    <button
                      onClick={() => updateListingStatus(listing.id, 'paused')}
                      className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-gray-300 transition-all"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => updateListingStatus(listing.id, 'active')}
                      className="px-3 py-2 text-xs bg-emerald-600/30 hover:bg-emerald-600/50 rounded text-emerald-300 transition-all"
                    >
                      Activate
                    </button>
                  )}

                  <button
                    onClick={() => deleteListing(listing.id)}
                    className="px-3 py-2 text-xs bg-red-600/20 hover:bg-red-600/40 rounded text-red-300 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
