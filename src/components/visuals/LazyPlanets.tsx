"use client";

import dynamic from "next/dynamic";

/**
 * The background bodies, out of the page's HTML and first bundle. Their paths
 * were about half a megabyte of a one-megabyte document, parsed and hydrated
 * before a visitor could scroll. They are decoration, absolutely positioned, so
 * arriving a moment later shifts nothing.
 */
export const GeometricPlanet = dynamic(() => import("./GeometricPlanet"), { ssr: false });
export const GeometricJupiter = dynamic(() => import("./GeometricJupiter"), { ssr: false });
export const GeometricNeptune = dynamic(() => import("./GeometricNeptune"), { ssr: false });
export const GeometricMars = dynamic(() => import("./GeometricMars"), { ssr: false });
export const GeometricBlackHole = dynamic(() => import("./GeometricBlackHole"), { ssr: false });
