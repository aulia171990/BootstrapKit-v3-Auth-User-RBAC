import React from 'react';
import { Plus, Mail, Phone, Calendar, Clock, ImagePlus, UploadCloud } from 'lucide-react';
import {
  Input, Textarea, Password, Checkbox, Switch, Radio, Select, Autocomplete,
  Search, DatePicker, TimePicker, RangePicker, OTPInput, Slider, Upload, ImageUpload,
  NumberInput, CurrencyInput, PhoneInput, EmailInput, Combobox,
  HelperText, ValidationMessage, CharacterCounter,
} from '../index.js';

/** Phase 2B — reusable form components usage examples (Storybook-style, no Storybook dep). */
const opts = [
  { value: 'jkt', label: 'Jakarta' },
  { value: 'bdo', label: 'Bandung' },
  { value: 'sby', label: 'Surabaya' },
  { value: 'den', label: 'Denpasar' },
];

export const TextFields = (
  <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
    <Input label="Name" placeholder="Budi" helperText="As on ID" />
    <EmailInput label="Email" placeholder="you@mail.com" />
    <PhoneInput label="Phone" countryCode="+62" />
    <Password label="Password" />
    <Textarea label="Notes" maxLength={120} value="" />
    <Search placeholder="Search orders…" />
  </div>
);

export const TypedInputs = (
  <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
    <NumberInput label="Quantity" value={3} stepper />
    <CurrencyInput label="Fare" value={25000} currency="Rp" />
    <Combobox label="Cities" options={opts} value={['jkt']} />
    <Select label="Role" options={opts} placeholder="Pick…" />
    <Autocomplete label="City" options={opts} />
  </div>
);

export const Pickers = (
  <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
    <DatePicker label="Date" />
    <TimePicker label="Time" />
    <RangePicker label="Range" startValue="" endValue="" />
    <OTPInput length={6} />
    <Slider value={40} />
  </div>
);

export const Toggles = (
  <div style={{ display: 'grid', gap: 12 }}>
    <Checkbox label="Accept terms" />
    <Switch label="Notifications" checked />
    <Radio label="Option A" name="grp" />
    <Radio label="Option B" name="grp" />
  </div>
);

export const Uploads = (
  <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
    <Upload onFiles={() => {}} label="Drop file or click" />
    <ImageUpload onFiles={() => {}} label="Drop image or click" />
  </div>
);

export const HelperExamples = (
  <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
    <HelperText>Helper guidance text.</HelperText>
    <ValidationMessage>Field is required.</ValidationMessage>
    <CharacterCounter value={42} max={120} />
  </div>
);

export default { TextFields, TypedInputs, Pickers, Toggles, Uploads, HelperExamples };
