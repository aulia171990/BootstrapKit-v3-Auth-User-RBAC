import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Icon from '../Icon/index.js';
import Input from '../Input/index.js';
import { cx } from '../_util.js';
import '../../components/__forms.css';

/**
 * Password — Input with show/hide toggle (Eye/EyeOff).
 * Forwards all Input props (label/hint/error/etc).
 */
const Password = forwardRef(function Password(props, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="ds-control-wrap has-icon has-toggle">
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        leftIcon={Eye}
        {...props}
      />
      <button
        type="button"
        className="ds-control-wrap__toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <Icon icon={show ? EyeOff : Eye} size="sm" />
      </button>
    </div>
  );
});

export default Password;
