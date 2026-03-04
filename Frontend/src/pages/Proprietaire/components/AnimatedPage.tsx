import React from 'react';
import '../animations.css';

interface AnimatedPageProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'slideInScale' | 'bounceIn';
  delay?: number;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = ''
}) => {
  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';

  return (
    <div className={`animate-${animation} ${delayClass} ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedPage;
