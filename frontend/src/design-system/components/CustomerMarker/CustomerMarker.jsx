import React from 'react';
import { CustomerMarker as Inner } from '../_maps/BaseMarker.jsx';
import '../_maps/_maps.css';

/** CustomerMarker — pin for a customer/passenger on the map. */
export default function CustomerMarker(props) { return <Inner {...props} />; }
