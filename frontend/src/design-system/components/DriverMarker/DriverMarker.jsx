import React from 'react';
import { DriverMarker as Inner } from '../_maps/BaseMarker.jsx';
import '../_maps/_maps.css';

/** DriverMarker — pin for a driver on the map. */
export default function DriverMarker(props) { return <Inner {...props} />; }
