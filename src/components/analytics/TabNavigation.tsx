import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`neon-tab flex items-center space-x-2 ${isActive ? 'active' : ''}`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
            <span className={`font-medium ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export { TabNavigation };
