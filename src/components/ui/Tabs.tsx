import React, { useState } from 'react';

interface TabsProps {
  children: React.ReactElement[];
  defaultValue?: string;
}

interface TabsListProps {
  children: React.ReactElement[];
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || children[0].props.value);

  return (
    <div className="tabs">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children }) => {
  return <div className="tabs-list">{children}</div>;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, activeTab, setActiveTab }) => {
  return (
    <button
      className={`tabs-trigger ${activeTab === value ? 'active' : ''}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, activeTab }) => {
  if (activeTab !== value) return null;
  return <div className="tabs-content">{children}</div>;
};