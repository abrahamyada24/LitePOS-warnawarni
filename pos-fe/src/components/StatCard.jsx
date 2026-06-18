import { TrendingUp, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, isAlert }) => {
  const getIconColor = () => {
    if (isAlert) return 'bg-red-50 text-red-500';
    return 'bg-blue-50 text-blue-500';
  };

  const getTrendColor = () => {
    if (isAlert && trend === 'down') return 'text-red-500'; 
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="card-base p-6 hover:shadow-md transition-shadow bg-white rounded-2xl border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${getIconColor()}`}>
          <Icon size={22} />
        </div>
      </div>
      
      <div className="flex items-center text-sm">
        {trend === 'up' && <TrendingUp size={16} className="text-green-500 mr-1" />}
        {trend === 'down' && <TrendingUp size={16} className="text-red-500 mr-1 rotate-180" />}
        
        <span className={`font-medium ${getTrendColor()}`}>
          {trendValue}
        </span>
        
        <span className="text-gray-400 ml-1">{subtitle}</span>
      </div>
    </div>
  );
};

export default StatCard;