import { cn } from '../../utils/cn';

const colorMap = {
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-950/50',
    icon: 'text-indigo-600 dark:text-indigo-400',
    trend: 'text-indigo-600 dark:text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
    trend: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    icon: 'text-amber-600 dark:text-amber-400',
    trend: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-950/50',
    icon: 'text-rose-600 dark:text-rose-400',
    trend: 'text-rose-600 dark:text-rose-400',
  },
  sky: {
    bg: 'bg-sky-100 dark:bg-sky-950/50',
    icon: 'text-sky-600 dark:text-sky-400',
    trend: 'text-sky-600 dark:text-sky-400',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-950/50',
    icon: 'text-violet-600 dark:text-violet-400',
    trend: 'text-violet-600 dark:text-violet-400',
  },
};

const StatsCard = ({ title, value, icon: Icon, trend, color = 'indigo', className }) => {
  const palette = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800',
        'bg-white dark:bg-gray-900 p-6 shadow-sm',
        'transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </p>
          {trend != null && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                  trend >= 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                )}
              >
                {trend >= 0 ? '+' : ''}
                {trend}%
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">vs last week</span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl',
              palette.bg
            )}
          >
            <Icon className={cn('w-6 h-6', palette.icon)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
