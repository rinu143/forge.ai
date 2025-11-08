import React from 'react';
import { FounderProfile, FundingStage, RunwayUnit } from '../types';

interface FounderProfileFormProps {
  profile: FounderProfile;
  setProfile: React.Dispatch<React.SetStateAction<FounderProfile>>;
  disabled: boolean;
}

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`w-full p-2 text-sm sm:text-base bg-gray-50 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-white/10 rounded-md text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-brand)] transition-all duration-300 ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`w-full p-2 text-sm sm:text-base bg-gray-50 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-white/10 rounded-md text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-brand)] transition-all duration-300 ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`} />
);


const FounderProfileForm: React.FC<FounderProfileFormProps> = ({ profile, setProfile, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | string[] = value;

    if (name === 'experience_years' || name === 'team_size' || name === 'runway_months') {
      let numValue = parseInt(value, 10);
      if (isNaN(numValue)) numValue = name === 'experience_years' ? 0 : 1;
      if (name !== 'experience_years' && numValue < 1) numValue = 1;
      if (name === 'experience_years' && numValue < 0) numValue = 0;
      processedValue = numValue;
    } else if (name === 'tech_stack') {
      // Store the raw string value, will parse it for display only
      setProfile(prev => ({
        ...prev,
        tech_stack: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      }));
      return; // Exit early to avoid the setProfile at the end
    } else if (name === 'runway_unit') {
      processedValue = value as RunwayUnit;
    }

    setProfile(prev => ({ ...prev, [name]: processedValue }));
  };

  // Store the raw input value for tech stack
  const [techStackInput, setTechStackInput] = React.useState('');

  const handleTechStackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = techStackInput.trim();
      if (value && !profile.tech_stack.includes(value)) {
        setProfile(prev => ({
          ...prev,
          tech_stack: [...prev.tech_stack, value]
        }));
        setTechStackInput('');
      }
    } else if (e.key === 'Backspace' && techStackInput === '' && profile.tech_stack.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      setProfile(prev => ({
        ...prev,
        tech_stack: prev.tech_stack.slice(0, -1)
      }));
    }
  };

  const removeTechStack = (indexToRemove: number) => {
    setProfile(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, index) => index !== indexToRemove)
    }));
  };

  const fundingStages: FundingStage[] = ["pre-seed", "seed", "pre-series-a", "series-a+"];
  const runwayUnits: RunwayUnit[] = ["hours", "days", "months", "years"];

  return (
    <div className="bg-gray-50 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-black dark:text-gray-200 mb-3 sm:mb-4">Founder Profile</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="experience_years">Experience (Years)</Label>
          <Input type="number" name="experience_years" id="experience_years" value={profile.experience_years === 0 ? '0' : profile.experience_years || ''} onChange={handleChange} disabled={disabled} min="0" placeholder="e.g., 2" />
        </div>
        <div>
          <Label htmlFor="team_size">Team Size</Label>
          <Input type="number" name="team_size" id="team_size" value={profile.team_size || ''} onChange={handleChange} disabled={disabled} min="1" placeholder="e.g., 1" />
        </div>
        <div>
          <Label htmlFor="runway_months">Runway</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              name="runway_months"
              id="runway_months"
              value={profile.runway_months || ''}
              onChange={handleChange}
              disabled={disabled}
              min="1"
              placeholder="e.g., 6"
              className="flex-1"
            />
            <Select
              name="runway_unit"
              id="runway_unit"
              value={profile.runway_unit || 'months'}
              onChange={handleChange}
              disabled={disabled}
              className="w-28"
            >
              {runwayUnits.map(unit => (
                <option key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <Label htmlFor="tech_stack">Tech Stack (Press Enter or comma to add)</Label>
          <div className="w-full min-h-[42px] p-2 bg-gray-50 dark:bg-[#1a1a1a]/50 border border-gray-200 dark:border-white/10 rounded-md focus-within:ring-2 focus-within:ring-[var(--primary-brand)] transition-all duration-300">
            <div className="flex flex-wrap gap-1.5 items-center">
              {profile.tech_stack.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white"
                >
                  {tech}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeTechStack(index)}
                      className="ml-1 hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${tech}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))}
              <input
                type="text"
                name="tech_stack"
                id="tech_stack"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                onKeyDown={handleTechStackKeyDown}
                disabled={disabled}
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm sm:text-base text-black dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                placeholder={profile.tech_stack.length === 0 ? "e.g., React (press Enter)" : "Add more..."}
              />
            </div>
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="funding_stage">Funding Stage</Label>
          <Select name="funding_stage" id="funding_stage" value={profile.funding_stage} onChange={handleChange} disabled={disabled}>
            {fundingStages.map(stage => <option key={stage} value={stage}>{stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor="location">Location</Label>
          <Input type="text" name="location" id="location" value={profile.location} onChange={handleChange} disabled={disabled} placeholder="e.g., Bangalore, India" />
        </div>
      </div>
    </div>
  );
};

export default FounderProfileForm;