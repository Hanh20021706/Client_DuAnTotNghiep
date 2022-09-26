import React from 'react';
import './result.css';

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Result = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const mode = primary ? 'result--primary' : 'result--';
  return (
    <div className={['result--primary', `result--${size}`, mode].join(' ')}>
      <p >Câu trả lời chính xác</p>
      <button  >
        Tiếp tục
      </button>
    </div>

  );
};
