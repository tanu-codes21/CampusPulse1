'use client';

import React, { useState } from 'react';
import {
  Users,
  ShoppingBag,
  Plus,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Flag,
  CheckCircle,
  AlertTriangle,
  X,
  MessageCircle,
  DollarSign,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Club, ExchangeListing, ExchangeCategory } from '@/types';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';
import { NeoInput, NeoTextArea } from '../common/NeoInput';
import { Badge } from '../common/Badge';

export const CampusCommunity: React.FC = () => {
  const { user } = useAuth();
  const { clubs, exchangeListings, addExchangeListing, reportExchangeListing } = useData();

  const [activeTab, setActiveTab] = useState<'clubs' | 'exchange'>('clubs');

  // Exchange filter & search
  const [exchangeSearch, setExchangeSearch] = useState('');
  const [selectedExCategory, setSelectedExCategory] = useState<string>('All');

  // Modals
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [contactingListing, setContactingListing] = useState<ExchangeListing | null>(null);
  const [reportingListing, setReportingListing] = useState<ExchangeListing | null>(null);
  const [reportReason, setReportReason] = useState('Misleading information or price gouging');
  const [reportDetails, setReportDetails] = useState('');

  // New Listing Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('0');
  const [newIsFree, setNewIsFree] = useState(false);
  const [newCategory, setNewCategory] = useState<ExchangeCategory>('Books');
  const [newCondition, setNewCondition] = useState<'Brand New' | 'Like New' | 'Good' | 'Fair'>('Good');

  const exchangeCategories: ExchangeCategory[] = [
    'Books',
    'Study Materials',
    'Lab Equipment',
    'Electronics',
    'Other',
  ];

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert('Title and description are required.');
      return;
    }

    await addExchangeListing({
      title: newTitle,
      description: newDesc,
      price: newIsFree ? 0 : parseFloat(newPrice) || 0,
      isFree: newIsFree,
      category: newCategory,
      condition: newCondition,
      ownerName: user?.fullName || 'Campus Student',
      ownerEmail: user?.email || 'student@campuspulse.edu',
      ownerPhone: '+91 98765 00000',
    });

    setNewTitle('');
    setNewDesc('');
    setNewPrice('0');
    setNewIsFree(false);
    setIsListingModalOpen(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingListing) return;

    await reportExchangeListing(reportingListing.id, reportReason, reportDetails);
    alert('Thank you. This listing has been flagged and submitted to CampusPulse moderators.');
    setReportingListing(null);
    setReportDetails('');
  };

  const filteredExchange = exchangeListings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(exchangeSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(exchangeSearch.toLowerCase());
    const matchesCat = selectedExCategory === 'All' || item.category === selectedExCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-accent-orange border border-orange-200/50">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-neo-primary dark:text-white">
              Campus Community
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neo-secondary dark:text-neo-darkSecondary mt-1">
            Connect with technical & cultural societies, discover campus events, or buy and exchange textbooks.
          </p>
        </div>

        {activeTab === 'exchange' && (
          <NeoButton
            variant="accent-orange"
            size="md"
            onClick={() => setIsListingModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            List Item for Exchange
          </NeoButton>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-neo-card dark:bg-neo-darkCard border border-neo-border dark:border-neo-darkBorder shadow-neo-raised-sm gap-2 max-w-md">
        <button
          onClick={() => setActiveTab('clubs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'clubs'
              ? 'bg-accent-orange text-white shadow-md'
              : 'text-neo-secondary hover:text-neo-primary'
          }`}
        >
          <Users className="w-4 h-4" />
          Clubs & Societies ({clubs.length})
        </button>

        <button
          onClick={() => setActiveTab('exchange')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'exchange'
              ? 'bg-accent-orange text-white shadow-md'
              : 'text-neo-secondary hover:text-neo-primary'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Student Exchange ({exchangeListings.length})
        </button>
      </div>

      {/* TAB 1: CLUBS & SOCIETIES */}
      {activeTab === 'clubs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <NeoCard
                key={club.id}
                accent="orange"
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="orange">{club.category}</Badge>
                    <span className="text-xs font-semibold text-neo-secondary">
                      {club.memberCount} Members
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-neo-primary dark:text-white">
                      {club.name}
                    </h3>
                    <p className="text-xs text-neo-secondary dark:text-neo-darkSecondary mt-1 leading-relaxed">
                      {club.description}
                    </p>
                  </div>

                  {/* Club Lead */}
                  <div className="pt-2 border-t border-neo-border/60 text-xs text-neo-secondary space-y-1">
                    <p className="font-semibold text-neo-primary dark:text-white">
                      President / Lead: {club.leadName}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-accent-orange" />
                      {club.leadEmail}
                    </p>
                  </div>

                  {/* Upcoming Club Events */}
                  {club.events && club.events.length > 0 && (
                    <div className="pt-2 border-t border-neo-border/60 space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-accent-orange">
                        Upcoming Club Events ({club.events.length})
                      </h4>
                      {club.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-2.5 rounded-xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border text-xs space-y-1"
                        >
                          <p className="font-bold text-neo-primary dark:text-white truncate">
                            {ev.title}
                          </p>
                          <div className="text-[11px] text-neo-secondary flex items-center justify-between">
                            <span>📅 {ev.date} • {ev.time}</span>
                            <span className="text-accent-orange font-semibold">{ev.venue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-neo-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-neo-secondary">Official Chapter</span>
                  {club.registrationUrl && (
                    <a
                      href={club.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-accent-orange text-white shadow-sm hover:brightness-105"
                    >
                      Join Club <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </NeoCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT EXCHANGE CORNER */}
      {activeTab === 'exchange' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <NeoCard className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <NeoInput
                  placeholder="Search used textbooks, calculators, lab coats, hardware..."
                  icon={<Search className="w-4 h-4" />}
                  value={exchangeSearch}
                  onChange={(e) => setExchangeSearch(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-60">
                <select
                  value={selectedExCategory}
                  onChange={(e) => setSelectedExCategory(e.target.value)}
                  className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-orange/60"
                >
                  <option value="All">All Categories</option>
                  {exchangeCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </NeoCard>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExchange.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <ShoppingBag className="w-12 h-12 text-neo-secondary/40 mx-auto mb-3" />
                <p className="text-base font-bold text-neo-primary dark:text-white">
                  No listings found
                </p>
                <p className="text-xs text-neo-secondary mt-1">
                  Be the first to list a textbook or lab equipment for peer exchange!
                </p>
              </div>
            ) : (
              filteredExchange.map((item) => (
                <NeoCard
                  key={item.id}
                  accent="orange"
                  hoverEffect
                  className="flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="orange">{item.category}</Badge>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.condition}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-neo-primary dark:text-white leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neo-secondary dark:text-neo-darkSecondary mt-1.5 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-xl font-black text-accent-orange">
                        {item.isFree || item.price === 0 ? 'FREE (Giveaway)' : `₹${item.price}`}
                      </span>
                      <span className="text-[11px] text-neo-secondary">
                        by {item.ownerName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neo-border/60 flex items-center justify-between">
                    <button
                      onClick={() => setReportingListing(item)}
                      className="text-[11px] text-neo-secondary hover:text-rose-500 flex items-center gap-1"
                      title="Report this listing"
                    >
                      <Flag className="w-3 h-3" /> Report
                    </button>

                    <NeoButton
                      variant="accent-orange"
                      size="sm"
                      onClick={() => setContactingListing(item)}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Contact Seller
                    </NeoButton>
                  </div>
                </NeoCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONTACT LISTING OWNER */}
      {contactingListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <h2 className="text-base font-bold text-neo-primary dark:text-white">
                Contact Listing Owner
              </h2>
              <button onClick={() => setContactingListing(null)}>
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-neo-bg dark:bg-neo-darkBg border border-neo-border">
              <p className="font-bold text-sm text-neo-primary dark:text-white">
                {contactingListing.title}
              </p>
              <p className="text-xs text-accent-orange font-bold mt-0.5">
                {contactingListing.isFree ? 'FREE' : `₹${contactingListing.price}`}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-neo-card border border-neo-border flex items-center justify-between">
                <span className="text-neo-secondary font-medium">Owner Name:</span>
                <span className="font-bold text-neo-primary dark:text-white">{contactingListing.ownerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-neo-card border border-neo-border flex items-center justify-between">
                <span className="text-neo-secondary font-medium">Email:</span>
                <a
                  href={`mailto:${contactingListing.ownerEmail}?subject=CampusPulse Exchange: ${encodeURIComponent(contactingListing.title)}`}
                  className="font-bold text-accent-orange hover:underline"
                >
                  {contactingListing.ownerEmail}
                </a>
              </div>
              {contactingListing.ownerPhone && (
                <div className="p-3 rounded-xl bg-neo-card border border-neo-border flex items-center justify-between">
                  <span className="text-neo-secondary font-medium">Phone / WhatsApp:</span>
                  <a
                    href={`https://wa.me/${contactingListing.ownerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-600 hover:underline"
                  >
                    {contactingListing.ownerPhone}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <NeoButton variant="secondary" onClick={() => setContactingListing(null)}>
                Close
              </NeoButton>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORT LISTING */}
      {reportingListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleReportSubmit}
            className="w-full max-w-md bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <div className="flex items-center gap-2 text-rose-500">
                <Flag className="w-5 h-5" />
                <h2 className="text-base font-bold text-neo-primary dark:text-white">
                  Report Listing
                </h2>
              </div>
              <button type="button" onClick={() => setReportingListing(null)}>
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <p className="text-xs text-neo-secondary">
              Report &ldquo;{reportingListing.title}&rdquo; for moderation review.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                Reason for Reporting
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
              >
                <option value="Misleading information or price gouging">Misleading information or price gouging</option>
                <option value="Inappropriate or prohibited academic content">Inappropriate or prohibited content</option>
                <option value="Spam or fraudulent listing">Spam or fraudulent listing</option>
                <option value="Item already sold or unavailable">Item already sold or unavailable</option>
                <option value="Other concern">Other concern</option>
              </select>
            </div>

            <NeoTextArea
              label="Additional details (optional)"
              placeholder="Provide context for our campus moderators..."
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" type="button" onClick={() => setReportingListing(null)}>
                Cancel
              </NeoButton>
              <NeoButton variant="danger" type="submit">
                Submit Report
              </NeoButton>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE NEW LISTING */}
      {isListingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateListing}
            className="w-full max-w-lg bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <h2 className="text-lg font-bold text-neo-primary dark:text-white">
                List Item for Exchange / Sale
              </h2>
              <button type="button" onClick={() => setIsListingModalOpen(false)}>
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <NeoInput
              label="Item Title"
              placeholder="e.g. Operating Systems Dinosaur Book 10th Ed"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <NeoTextArea
              label="Description & Notes"
              placeholder="Describe condition, edition, highlightings, included accessories..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExchangeCategory)}
                  className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
                >
                  {exchangeCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                  Condition
                </label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value as any)}
                  className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neo-primary dark:text-white">
                <input
                  type="checkbox"
                  checked={newIsFree}
                  onChange={(e) => setNewIsFree(e.target.checked)}
                  className="rounded text-accent-orange"
                />
                <span>Offer for Free (Campus Giveaway / Community Donation)</span>
              </label>

              {!newIsFree && (
                <NeoInput
                  type="number"
                  label="Price in INR (₹)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  min="0"
                  required
                />
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" type="button" onClick={() => setIsListingModalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="accent-orange" type="submit">
                Publish Listing
              </NeoButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

