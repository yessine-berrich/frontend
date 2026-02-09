'use client';

const monthData = [
  { month: 'Jan', articles: 12, commentaires: 45 },
  { month: 'Fév', articles: 18, commentaires: 65 },
  { month: 'Mar', articles: 15, commentaires: 52 },
  { month: 'Avr', articles: 22, commentaires: 88 },
  { month: 'Mai', articles: 28, commentaires: 115 },
  { month: 'Juin', articles: 24, commentaires: 95 },
];

export default function PublicationActivity() {
  const maxValue = Math.max(
    ...monthData.map((d) => Math.max(d.articles, d.commentaires))
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activité de publication
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          6 derniers mois
        </p>
      </div>

      {/* Chart */}
      <div className="relative h-72">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 text-right pr-2">
          <span>{maxValue + 20}</span>
          <span>{Math.round((maxValue + 20) * 0.75)}</span>
          <span>{Math.round((maxValue + 20) * 0.5)}</span>
          <span>{Math.round((maxValue + 20) * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-gray-100 dark:border-gray-800"></div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute left-10 right-0 top-0 bottom-8 flex items-end justify-around gap-4">
          {monthData.map((data) => {
            const articlesHeight = (data.articles / (maxValue + 20)) * 100;
            const commentairesHeight = (data.commentaires / (maxValue + 20)) * 100;

            return (
              <div key={data.month} className="flex flex-col items-center gap-1 flex-1">
                {/* Bars container */}
                <div className="w-full flex items-end justify-center gap-1.5 group">
                  {/* Articles bar */}
                  <div className="relative flex-1 max-w-[40px]">
                    <div
                      className="w-full bg-blue-600 dark:bg-blue-500 rounded-t hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${articlesHeight}%`, minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {data.articles} articles
                      </div>
                    </div>
                  </div>

                  {/* Commentaires bar */}
                  <div className="relative flex-1 max-w-[40px]">
                    <div
                      className="w-full bg-cyan-400 dark:bg-cyan-500 rounded-t hover:bg-cyan-500 dark:hover:bg-cyan-600 transition-colors cursor-pointer"
                      style={{ height: `${commentairesHeight}%`, minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {data.commentaires} commentaires
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-10 right-0 bottom-0 h-8 flex items-center justify-around text-xs text-gray-600 dark:text-gray-400">
          {monthData.map((data) => (
            <div key={data.month} className="flex-1 text-center">
              {data.month}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Articles</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-cyan-400 dark:bg-cyan-500 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300">Commentaires</span>
        </div>
      </div>
    </div>
  );
}