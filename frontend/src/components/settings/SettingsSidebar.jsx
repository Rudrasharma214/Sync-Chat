import React from "react";

const SettingsSidebar = ({ sections, activeSection, onSectionChange }) => {
  return (
    <aside className="theme-border border-b p-3 md:border-b-0 md:border-r md:p-4">
      <div className="mb-3 px-2">
        <h1 className="theme-text text-xl font-semibold">Settings</h1>
        <p className="theme-muted mt-1 text-xs">Quick control panel</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-1 md:pb-0">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                isActive
                  ? "border-amber-500/70 bg-amber-500/10 text-amber-500"
                  : "theme-border theme-muted hover:border-amber-500/70 hover:text-amber-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
