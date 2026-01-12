import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { View, OrthographicCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Cabinet } from './Cabinet';
import { useStore } from '../store/useStore';

// Responsive Camera component that aligns zoom to fit content in the actual viewport pixels
const ResponsiveCamera = ({ targetCenter, envelopeSize, cameraUp, initialPosition }: { targetCenter: [number, number, number], envelopeSize: number, cameraUp: [number, number, number], initialPosition: [number, number, number] }) => {
    const { size } = useThree(); // size is in pixels
    const cameraRef = useRef<THREE.OrthographicCamera>(null);

    useLayoutEffect(() => {
        if (!cameraRef.current) return;
        const cam = cameraRef.current;

        // Calculate zoom to fit 'envelopeSize' (world units) into the smallest viewport dimension (pixels)
        const minViewportDim = Math.min(size.width, size.height);

        // Safety margin ratio (0.85 means occupy 85% of the screen width/height to be extra safe)
        const fitRatio = 0.85;

        const newZoom = (minViewportDim / envelopeSize) * fitRatio;

        cam.zoom = newZoom;

        // Update frustum to match viewport aspect ratio at this zoom
        // This logic mimics standard R3F behavior but with our calculated fixed scale
        cam.left = -size.width / 2 / newZoom;
        cam.right = size.width / 2 / newZoom;
        cam.top = size.height / 2 / newZoom;
        cam.bottom = -size.height / 2 / newZoom;

        // CRITICAL FIX: Ensure camera is positioned along the viewing axis relative to targetCenter
        // to prevent "axonometric" skew.
        // We keep the axis-component from initialPosition (e.g. Y=10000 for Plan)
        // but sync the other components to targetCenter.

        const currentPos = cam.position.clone();

        // Plan View (Up: 0,0,-1. View: -Y). Position should be [targetX, fixedY, targetZ]
        if (cameraUp[2] === -1 || (cameraUp[0] === 0 && cameraUp[1] === 0 && cameraUp[2] === -1)) {
            cam.position.set(targetCenter[0], currentPos.y, targetCenter[2]);
        }
        // Section/Elevation (Up: 0,1,0)
        else {
            // If viewing from Z (Elevation)
            if (Math.abs(initialPosition[2]) > 5000) {
                cam.position.set(targetCenter[0], targetCenter[1], currentPos.z);
            }
            // If viewing from X (Section)
            else if (Math.abs(initialPosition[0]) > 5000) {
                cam.position.set(currentPos.x, targetCenter[1], targetCenter[2]);
            }
        }

        cam.updateProjectionMatrix();
        cam.lookAt(...targetCenter);

    }, [size, envelopeSize, targetCenter, cameraUp, initialPosition]);

    return <OrthographicCamera ref={cameraRef} makeDefault up={cameraUp} position={initialPosition} near={-50000} far={50000} />;
};

const TechView = ({ type, targetCenter, envelopeSize, cameraUp }: { type: 'plan' | 'elevation' | 'section', targetCenter: [number, number, number], envelopeSize: number, cameraUp: [number, number, number] }) => {
    // Determine strict axis-aligned positions
    const initialPosition: [number, number, number] =
        type === 'plan' ? [0, 10000, 0] :
            type === 'elevation' ? [0, 0, 10000] :
                [10000, 0, 0];

    return (
        <div className="viewport-2d" style={{ width: '100%', height: '100%', position: 'relative' }} id={`viewport-${type}`}>
            <div className="viewport-label" style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' }}>
                {type.toUpperCase()}
            </div>
            <View
                className="tech-viewport-canvas"
                style={{ width: '100%', height: '100%', background: 'white' }}
            >
                <color attach="background" args={['white']} />

                {/* Responsive Camera controls projection and position */}
                <ResponsiveCamera targetCenter={targetCenter} envelopeSize={envelopeSize} cameraUp={cameraUp} initialPosition={initialPosition} />
                <ambientLight intensity={3} />

                <Cabinet viewMode={type} />
            </View>
        </div>
    );
};

export const TechViewports = () => {
    const { width, height, depth, numDoors, doorsOpen, floorHeight } = useStore();

    // Constants matching Cabinet.tsx sizing
    const labelOffset = 200;
    const doorExtValue = doorsOpen ? (width / Math.max(1, numDoors)) : 0;

    // Safety margin to prevent touching viewport edges (white frame requirement)
    // This value represents a "bleed" area around the drawing.
    const padding = 300; // Increased padding

    // Calculate the maximum required world dimension for each view, including padding and labels/doors.
    // This will be used as the 'envelopeSize' for the ResponsiveCamera.
    // Plan View Envelope: Max of (Width + labelOffset) and (Depth + doorExtValue + labelOffset)
    const planEnvelopeSize = Math.max(width + labelOffset, depth + doorExtValue + labelOffset) + padding;

    // Elevation View Envelope: Max of (Width + labelOffset) and (Height + labelOffset)
    const elevationEnvelopeSize = Math.max(width + labelOffset, height + labelOffset) + padding;

    // Section View Envelope: Max of (Depth + doorExtValue + labelOffset) and (Height + labelOffset)
    const sectionEnvelopeSize = Math.max(depth + doorExtValue + labelOffset, height + labelOffset) + padding;

    // UNIFIED SCALING LOGIC
    // To ensure all drawings are at the SAME scale, we must use the largest required envelope
    // across ALL views to drive the zoom factor for ALL viewports.
    const globalMaxEnvelope = Math.max(planEnvelopeSize, elevationEnvelopeSize, sectionEnvelopeSize);

    // CENTER CALCULATION
    // Cabinet is centered at [0, height/2 + floorHeight, 0] in world space.
    // We shift the camera target to center the *entire* envelope (object + labels + doors).

    const techCenterY = height / 2 + floorHeight;
    // Horizontal shift for labels on left (X-axis for Plan/Elevation, Z-axis for Section)
    const shiftX = labelOffset / 2;
    // Vertical shift for Plan view (Z-axis): Top is -Z (labels), Bottom is +Z (doors).
    // The center should be shifted by half the difference between door extension and label offset.
    const shiftZ = (doorExtValue - labelOffset) / 2;

    // Elevation Center: X-axis shifted for labels, Y-axis shifted for labels. Z is 0.
    const elevationCenter: [number, number, number] = [-shiftX, techCenterY + labelOffset / 2, 0];
    const elevationCameraUp: [number, number, number] = [0, 1, 0];

    // Plan Center: X-axis shifted for labels, Y-axis is cabinet center, Z-axis shifted for labels/doors.
    const planCenter: [number, number, number] = [-shiftX, techCenterY, shiftZ];
    const planCameraUp: [number, number, number] = [0, 0, -1]; // Top is World -Z

    // Section Center: Viewed from +X. Horizontal on screen is Z, Vertical is Y.
    // Y-axis shifted for labels. Z-axis shifted for labels (no doors in section view).
    // In Section, `doorExtValue` is 0. So `shiftZ` would be `-labelOffset / 2`.
    // This means the Z-axis (horizontal on screen) needs to shift by `-labelOffset / 2` to center the depth + label.
    const sectionCenterAdjusted: [number, number, number] = [0, techCenterY + labelOffset / 2, -labelOffset / 2];

    const sectionCameraUp: [number, number, number] = [0, 1, 0];

    return (
        <>
            <TechView type="plan" targetCenter={planCenter} envelopeSize={globalMaxEnvelope} cameraUp={planCameraUp} />
            <TechView type="elevation" targetCenter={elevationCenter} envelopeSize={globalMaxEnvelope} cameraUp={elevationCameraUp} />
            <TechView type="section" targetCenter={sectionCenterAdjusted} envelopeSize={globalMaxEnvelope} cameraUp={sectionCameraUp} />
        </>
    );
};
