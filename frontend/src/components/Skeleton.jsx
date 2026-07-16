import React from 'react';

// Reusable animated skeleton elements
export function SkeletonPulse({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded-md ${className}`} />
  );
}

// 1. Skeleton Card for Experts (Grid Lists)
export function SkeletonExpertCard() {
  return (
    <div className="animate-pulse relative rounded-xl overflow-hidden shadow-md bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-0 flex flex-col">
      {/* Cover Image Placeholder */}
      <div className="h-48 md:h-52 bg-gray-200 dark:bg-slate-700 w-full" />
      
      {/* Content Area */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {/* Photo/Avatar Placeholder */}
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
          
          {/* Name & Title Placeholder */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/5" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Skeleton Row for Tables (Member, Payments, etc.)
export function SkeletonTableRow({ cols = 3 }) {
  return (
    <tr className="animate-pulse border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="px-6 py-4">
          <div className={`h-4 bg-gray-200 dark:bg-slate-700 rounded ${
            idx === 0 ? 'w-2/3' : idx === 1 ? 'w-1/2' : 'w-1/3'
          }`} />
        </td>
      ))}
    </tr>
  );
}

// 3. Skeleton Card for Pamflet/Brochures/Articles
export function SkeletonDocumentCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="h-44 bg-gray-200 dark:bg-slate-700" />
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
        <div className="mt-auto h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-full" />
      </div>
    </div>
  );
}

// 4. Skeleton Loader for Profil Detail Page (ProfilAhli, ProfilSaya)
export function SkeletonProfile() {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-900 min-h-screen">
      {/* Cover Banner */}
      <div className="h-64 md:h-80 bg-gray-200 dark:bg-slate-700 w-full" />
      
      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="relative -mt-24 md:-mt-32 flex flex-col md:flex-row md:items-end gap-6 mb-8">
          {/* Profile Photo */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white bg-gray-200 dark:bg-slate-700 shadow-lg shrink-0" />
          
          {/* Header Info */}
          <div className="flex-1 flex flex-col gap-3 pb-2">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-2/3 md:w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
          </div>
        </div>

        {/* Two-Column Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-8">
          {/* Sidebar Skeletons */}
          <div className="flex flex-col gap-6">
            <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
            </div>
            
            <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-16" />
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20" />
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-24" />
              </div>
            </div>
          </div>

          {/* Main Skeletons */}
          <div className="flex flex-col gap-6">
            <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-6 space-y-6">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
              
              <div className="space-y-4">
                {/* ListItem 1 */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-gray-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
                  </div>
                </div>
                {/* ListItem 2 */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-gray-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Skeleton Loader for Dashboard Area
export function SkeletonDashboard() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Banner/Header Skeleton */}
      <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl w-full" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Main Content Area */}
      <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/5" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
      </div>
    </div>
  );
}
