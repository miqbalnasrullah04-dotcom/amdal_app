import PropTypes from 'prop-types';

/**
 * Komponen untuk menampilkan badge level user (Bronze, Silver, Gold, Platinum, Diamond)
 * Berdasarkan total poin yang dikumpulkan
 */
export default function LevelBadge({ level, size = 'md', showLabel = true, className = '' }) {
  // Default level jika tidak ada
  if (!level || !level.name) {
    level = {
      name: 'Bronze',
      color: '#CD7F32',
      icon: 'workspace_premium',
      min: 0,
      max: 99,
    };
  }

  // Size variants
  const sizes = {
    sm: {
      badge: 'px-2 py-1',
      icon: 'text-[14px]',
      text: 'text-[10px]',
    },
    md: {
      badge: 'px-3 py-1.5',
      icon: 'text-[16px]',
      text: 'text-xs',
    },
    lg: {
      badge: 'px-4 py-2',
      icon: 'text-[20px]',
      text: 'text-sm',
    },
    xl: {
      badge: 'px-5 py-2.5',
      icon: 'text-[24px]',
      text: 'text-base',
    },
  };

  const sizeClasses = sizes[size] || sizes.md;

  // Background color dengan opacity untuk setiap level
  const bgColors = {
    Bronze: 'bg-[#CD7F32]/10',
    Silver: 'bg-[#C0C0C0]/20',
    Gold: 'bg-[#FFD700]/15',
    Platinum: 'bg-[#E5E4E2]/20',
    Diamond: 'bg-[#B9F2FF]/20',
  };

  const textColors = {
    Bronze: 'text-[#8B5A00]',
    Silver: 'text-[#6B6B6B]',
    Gold: 'text-[#B8860B]',
    Platinum: 'text-[#4A4A4A]',
    Diamond: 'text-[#0077BE]',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClasses.badge} ${bgColors[level.name] || bgColors.Bronze} ${textColors[level.name] || textColors.Bronze} ${className}`}
      title={`Level ${level.name} (${level.min}-${level.max === Number.MAX_SAFE_INTEGER ? '∞' : level.max} poin)`}
    >
      <span
        className={`material-symbols-outlined ${sizeClasses.icon}`}
        style={{ color: level.color }}
      >
        {level.icon}
      </span>
      {showLabel && (
        <span className={sizeClasses.text}>{level.name}</span>
      )}
    </div>
  );
}

LevelBadge.propTypes = {
  level: PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
  }),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};
