import React from 'react';

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  if (password.length === 0) return null;

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };

  const score = getStrength(password);
  const colors = ['#EF4444', '#F97316', '#EAB308', '#2DD4BF'];
  const labels = ['Faible', 'Moyen', 'Fort', 'Très fort'];

  const activeColor = score > 0 ? colors[score - 1] : '#9BA4B5';
  const activeLabel = score > 0 ? labels[score - 1] : 'Très faible';

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              score >= index ? 'opacity-100' : 'opacity-20'
            }`}
            style={{ backgroundColor: score >= index ? activeColor : '#9BA4B5' }}
          />
        ))}
      </div>
      <div className="font-mono text-[12px] text-text-muted text-right">
        {activeLabel}
      </div>
    </div>
  );
}
