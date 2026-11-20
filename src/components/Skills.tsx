import React from 'react';
import {
  Code2,
  Globe,
  Database,
  Cpu,
  Server,
  GitBranch,
  Sparkles,
  Terminal,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SkillDetail } from '../types';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

export const Skills: React.FC = () => {
  const { skillCategories, cmsConfig } = usePortfolio();
  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'skills');

  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Database':
        return <Database className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Server':
        return <Server className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'GitBranch':
        return <GitBranch className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <section
      id="skills"
      className={`${paddingClass} border-b border-slate-200 dark:border-slate-800/70`}
    >
      <div className={containerClass}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {secCfg?.title || 'Technical Skills'}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {secCfg?.subtitle || 'Categorized Programming & Computer Science Foundations'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category) => {
            const detailMap = new Map<string, SkillDetail>(
              (category.skillDetails || []).map((d) => [d.name.toLowerCase(), d])
            );
            return (
              <div
                key={category.id}
                className={`${radiusClass} ${cardStyleClass} p-6 hover:border-blue-500/40 transition-colors flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      {getIcon(category.iconName)}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {category.title}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 mt-2">
                    {category.skills.map((skill, idx) => {
                      const detail = detailMap.get(skill.toLowerCase());
                      return (
                        <li key={`${category.id}-${skill}-${idx}`} className="space-y-0.5">
                          <div className="flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-200 font-mono">
                            <span className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span className="truncate">{skill}</span>
                            </span>
                            {detail?.proficiency && (
                              <span className="text-[11px] font-sans text-blue-600 dark:text-blue-400 shrink-0">
                                {detail.proficiency}
                              </span>
                            )}
                          </div>
                          {detail?.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 pl-5.5">
                              {detail.description}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  <span>{category.skills.length} Technologies</span>
                  <span>Verified Skills</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
