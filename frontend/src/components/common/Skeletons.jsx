// Lightweight skeleton primitives for loading states
// Usage: wrap sections in a container with animate-pulse and compose blocks/text
const base = "bg-gray-300/60 dark:bg-gray-600/60 rounded";

export const SkeletonBlock = ({ className = "" }) => (
  <div className={`${base} ${className}`} />
);

export const SkeletonText = ({ className = "" }) => (
  <div className={`${base} h-3 ${className}`} />
);

export const SkeletonCircle = ({ className = "" }) => (
  <div className={`${base} rounded-full ${className}`} />
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`overflow-hidden border border-white/10 bg-white/10 backdrop-blur-sm ${base} ${className}`}>
    <SkeletonBlock className="h-40 w-full" />
    <div className="p-4 space-y-3">
      <SkeletonText className="w-1/2" />
      <SkeletonText className="w-2/3" />
      <SkeletonText className="w-1/3" />
    </div>
  </div>
);

export const SkeletonProductCard = () => (
  <div className="min-w-[320px] bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden animate-pulse">
    <SkeletonBlock className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <SkeletonText className="w-1/2 h-4" />
      <SkeletonText className="w-3/4 h-4" />
      <SkeletonText className="w-1/3 h-4" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-8 w-20" />
        <SkeletonBlock className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonBrandCard = () => (
  <div className="min-w-[200px] h-32 bg-white rounded-xl shadow-lg animate-pulse flex items-center justify-center px-6">
    <SkeletonBlock className="h-12 w-24" />
  </div>
);

export const SkeletonFilterPanel = () => (
  <div className="p-6 rounded-2xl bg-gradient-to-br from-dark via-dark to-dark/95 border border-primary/20 shadow-2xl animate-pulse space-y-4">
    <SkeletonBlock className="h-6 w-2/3" />
    <SkeletonText className="w-full" />
    <SkeletonText className="w-5/6" />
    <SkeletonText className="w-4/6" />
    <SkeletonText className="w-3/4" />
    <div className="grid grid-cols-2 gap-2">
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-full" />
    </div>
  </div>
);

export default SkeletonBlock;













