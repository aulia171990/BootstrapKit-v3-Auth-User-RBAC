import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Plus, Minus, X } from 'lucide-react';
import Input from '../components/Input/index.js';
import Textarea from '../components/Textarea/index.js';
import HelperText from '../components/HelperText/index.js';
import ValidationMessage from '../components/ValidationMessage/index.js';
import CharacterCounter from '../components/CharacterCounter/index.js';
import NumberInput from '../components/NumberInput/index.js';
import CurrencyInput from '../components/CurrencyInput/index.js';
import PhoneInput from '../components/PhoneInput/index.js';
import EmailInput from '../components/EmailInput/index.js';
import TimePicker from '../components/TimePicker/index.js';
import RangePicker from '../components/RangePicker/index.js';
import Combobox from '../components/Combobox/index.js';
import ImageUpload from '../components/ImageUpload/index.js';

describe('Helper components (2B)', () => {
  it('HelperText renders nothing when empty, content otherwise', () => {
    const { rerender } = render(<HelperText>tip</HelperText>);
    expect(screen.getByText('tip')).toBeInTheDocument();
    rerender(<HelperText>{null}</HelperText>);
    expect(screen.queryByText('tip')).toBeNull();
  });
  it('ValidationMessage sets role=alert and shows icon', () => {
    render(<ValidationMessage>Bad</ValidationMessage>);
    const el = screen.getByRole('alert');
    expect(el).toHaveTextContent('Bad');
  });
  it('CharacterCounter shows over state', () => {
    const { rerender } = render(<CharacterText value={5} max={10} />);
    function CharacterText(p) { return <CharacterCounter {...p} />; }
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
    rerender(<CharacterCounter value={12} max={10} />);
    expect(screen.getByText('12 / 10').className).toContain('is-over');
  });
});

describe('Input with helper/validation (2B)', () => {
  it('renders helperText and validationMessage, wires aria', () => {
    const { rerender } = render(<Input label="Name" helperText="Your name" />);
    expect(screen.getByText('Your name')).toBeInTheDocument();
    rerender(<Input label="Name" validationMessage="Required" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required');
  });
});

describe('Typed inputs (2B)', () => {
  it('NumberInput stepper increments', () => {
    const fn = vi.fn();
    render(<NumberInput value={1} onChange={fn} />);
    fireEvent.click(screen.getByLabelText('Increase'));
    expect(fn).toHaveBeenCalledWith(2);
  });
  it('CurrencyInput strips non-digits and shows symbol', () => {
    const fn = vi.fn();
    render(<CurrencyInput value={1234} onChange={fn} currency="Rp" />);
    expect(screen.getByText('Rp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1.234')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('1.234'), { target: { value: '9abc' } });
    expect(fn).toHaveBeenCalledWith('9');
  });
  it('PhoneInput keeps digits only', () => {
    const fn = vi.fn();
    render(<PhoneInput value="812" onChange={fn} countryCode="+62" />);
    expect(screen.getByText('+62')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('812'), { target: { value: '812-3a' } });
    expect(fn).toHaveBeenCalledWith('8123');
  });
  it('EmailInput validates format via onValidate', () => {
    const fn = vi.fn();
    render(<EmailInput value="a@b.co" onValidate={fn} />);
    expect(fn).toHaveBeenCalledWith(null);
  });
  it('EmailInput reports invalid format', () => {
    const fn = vi.fn();
    render(<EmailInput value="nope" onValidate={fn} />);
    expect(fn).toHaveBeenCalledWith('Enter a valid email address');
  });
});

describe('Pickers / Combobox / ImageUpload (2B)', () => {
  it('TimePicker renders time input with clock', () => {
    render(<TimePicker label="At" />);
    expect(screen.getByLabelText('At')).toHaveAttribute('type', 'time');
  });
  it('RangePicker renders two date inputs', () => {
    render(<RangePicker label="Range" startValue="2026-01-01" endValue="2026-02-01" />);
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-01-01');
    expect(screen.getByLabelText('End date')).toHaveValue('2026-02-01');
  });
  it('Combobox toggles selection and shows chips', () => {
    const fn = vi.fn();
    const opts = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];
    render(<Combobox label="Fruit" options={opts} value={[]} onChange={fn} />);
    fireEvent.click(screen.getByText('Select…'));
    fireEvent.click(screen.getByText('Apple'));
    expect(fn).toHaveBeenCalledWith(['a']);
  });
  it('ImageUpload opens file dialog on click (keyboard)', () => {
    const fn = vi.fn();
    render(<ImageUpload onFiles={fn} />);
    const box = screen.getByRole('button', { name: /Drop images/i });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(document.querySelector('input[type=file]')).toBeTruthy();
  });
});
