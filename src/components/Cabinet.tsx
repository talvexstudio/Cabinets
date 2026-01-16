import { useStore } from '../store/useStore';
import { useSpring, animated } from '@react-spring/three';
import { Edges, Text, ContactShadows, Line } from '@react-three/drei';
import * as THREE from 'three';

const PANEL_THICKNESS = 18; // mm
const DOOR_THICKNESS = 18; // mm

interface CabinetProps {
    viewMode?: '3d' | 'plan' | 'elevation' | 'section';
}

/**
 * Balanced Technical Dimension Component
 * Matches the cabinet drawing line weight for an integrated professional look.
 */
const DimensionLayout = ({ start, end, label, dir = 'h', offset = 160, fontS = 85, textOutside = false, textShift = 0 }: any) => {
    const color = "black";
    const lineThickness = 4.0; // Balanced boldness to match Edges
    const arrowSize = 18;
    const extensionGap = 15;
    const textGap = 85;

    const dimMaterial = <meshBasicMaterial color={color} />;

    const ArrowHead = ({ position, rotation }: any) => (
        <group position={position} rotation={rotation}>
            <mesh rotation-z={Math.PI / 4}>
                <boxGeometry args={[arrowSize, lineThickness, lineThickness]} />
                {dimMaterial}
            </mesh>
            <mesh rotation-z={-Math.PI / 4}>
                <boxGeometry args={[arrowSize, lineThickness, lineThickness]} />
                {dimMaterial}
            </mesh>
        </group>
    );

    if (dir === 'h') {
        const fullWidth = Math.abs(end[0] - start[0]);
        const center = (start[0] + end[0]) / 2;
        const y = start[1] + offset;
        const extLen = Math.abs(offset) + 25;

        return (
            <group position-z={start[2]}>
                {/* Extensions */}
                <mesh position={[start[0], start[1] + (offset > 0 ? extensionGap + extLen / 2 - 12 : -extensionGap - extLen / 2 + 12), 0]}>
                    <boxGeometry args={[lineThickness, extLen, lineThickness]} />
                    {dimMaterial}
                </mesh>
                <mesh position={[end[0], end[1] + (offset > 0 ? extensionGap + extLen / 2 - 12 : -extensionGap - extLen / 2 + 12), 0]}>
                    <boxGeometry args={[lineThickness, extLen, lineThickness]} />
                    {dimMaterial}
                </mesh>

                {/* Interrupted Lines */}
                <mesh position={[start[0] + (fullWidth / 2 - textGap / 2) / 2, y, 0]}>
                    <boxGeometry args={[(fullWidth - textGap) / 2, lineThickness, lineThickness]} />
                    {dimMaterial}
                </mesh>
                <mesh position={[end[0] - (fullWidth / 2 - textGap / 2) / 2, y, 0]}>
                    <boxGeometry args={[(fullWidth - textGap) / 2, lineThickness, lineThickness]} />
                    {dimMaterial}
                </mesh>

                <ArrowHead position={[start[0], y, 0]} rotation={[0, 0, 0]} />
                <ArrowHead position={[end[0], y, 0]} rotation={[0, 0, Math.PI]} />

                <Text position={[center + textShift, y, 1]} color={color} fontSize={fontS} anchorY="middle" anchorX="center">{label}</Text>
            </group>
        );
    } else {
        const fullHeight = Math.abs(end[1] - start[1]);
        const center = (start[1] + end[1]) / 2;
        const x = start[0] - offset;
        const extLen = Math.abs(offset) + 25;
        const labelX = x;
        const labelY = textOutside ? center + (textGap * 0.6) : center;

        return (
            <group position-z={start[2]}>
                {/* Extensions */}
                <mesh position={[start[0] - (offset > 0 ? extensionGap + extLen / 2 - 12 : -extensionGap - extLen / 2 + 12), start[1], 0]}>
                    <boxGeometry args={[extLen, lineThickness, lineThickness]} />
                    {dimMaterial}
                </mesh>
                <mesh position={[end[0] - (offset > 0 ? extensionGap + extLen / 2 - 12 : -extensionGap - extLen / 2 + 12), end[1], 0]}>
                    <boxGeometry args={[extLen, lineThickness, lineThickness]} />
                    {dimMaterial}
                </mesh>

                {/* Interrupted Lines */}
                <mesh position={[x, start[1] - (fullHeight / 2 - textGap / 2) / 2, 0]}>
                    <boxGeometry args={[lineThickness, (fullHeight - textGap) / 2, lineThickness]} />
                    {dimMaterial}
                </mesh>
                <mesh position={[x, end[1] + (fullHeight / 2 - textGap / 2) / 2, 0]}>
                    <boxGeometry args={[lineThickness, (fullHeight - textGap) / 2, lineThickness]} />
                    {dimMaterial}
                </mesh>

                <ArrowHead position={[x, start[1], 0]} rotation={[0, 0, -Math.PI / 2]} />
                <ArrowHead position={[x, end[1], 0]} rotation={[0, 0, Math.PI / 2]} />

                <Text position={[labelX, labelY, 1]} color={color} fontSize={fontS} anchorY="middle" anchorX="center">{label}</Text>
            </group>
        );
    }
};

export const Cabinet = ({ viewMode = '3d' }: CabinetProps) => {
    const { width, depth, blocks, floorHeight, cabinetColor, showSkirting, showFeet, recessDistance, numFeetPerRow } = useStore();

    const isTech = viewMode !== '3d';
    const hideSidePanel = viewMode === 'section';

    const techMaterial = <meshBasicMaterial color="white" polygonOffset polygonOffsetFactor={2} />;
    const realMaterial = <meshStandardMaterial color={cabinetColor} roughness={0.4} metalness={0.1} />;
    const accentMaterial = <meshStandardMaterial color={cabinetColor} roughness={0.5} />;

    const currentMaterial = isTech ? techMaterial : realMaterial;
    const currentAccent = isTech ? techMaterial : accentMaterial;

    const EdgeOverlay = () => isTech ? <Edges color="black" threshold={10} /> : null;

    const totalHeight = blocks.reduce((sum, block) => sum + block.height, 0);

    const getShelvesForBlock = (blockHeight: number, numShelves: number) => {
        const shelves: number[] = [];
        if (numShelves > 0) {
            const centerToCenterHeight = blockHeight - PANEL_THICKNESS;
            const spacing = centerToCenterHeight / (numShelves + 1);
            for (let i = 0; i < numShelves; i++) {
                const y = (-blockHeight / 2 + PANEL_THICKNESS / 2) + spacing * (i + 1);
                shelves.push(y);
            }
        }
        return shelves;
    };

    const getTrunkBodyHeight = (blockHeight: number, lidHeight: number) => {
        const safeLidHeight = Math.max(0, Math.min(lidHeight, blockHeight - PANEL_THICKNESS));
        return blockHeight - safeLidHeight;
    };

    // Feet Calculation - Manual input with uniform recess on all edges
    const feetPerRow = Math.max(2, numFeetPerRow);
    const feetInset = recessDistance + 20; // +2cm to avoid skirting clash
    const feetSpacing = feetPerRow > 1 ? (width - 2 * feetInset) / (feetPerRow - 1) : 0;
    const feet: Array<[number, number, number]> = [];

    if (showFeet && floorHeight > 0) {
        for (let i = 0; i < feetPerRow; i++) {
            const x = -width / 2 + feetInset + feetSpacing * i;
            // Front row
            feet.push([x, -totalHeight / 2 - floorHeight / 2, depth / 2 - feetInset]);
            // Back row
            feet.push([x, -totalHeight / 2 - floorHeight / 2, -depth / 2 + feetInset]);
        }
    }

    const FONT_SIZE = 70;

    const ShowDimensions = () => {
        if (!isTech) return null;

        const mainOffset = 180;
        const middleOffset = 340;
        const outerOffset = 500;
        const baseHeight = Math.max(0, floorHeight);
        const totalWithBase = totalHeight + baseHeight;
        const cabinetTopY = totalHeight / 2;
        const cabinetBottomY = -totalHeight / 2;
        const baseBottomY = cabinetBottomY - baseHeight;
        const minLabelSpan = FONT_SIZE * 1.4;
        const blockBounds = blocks.map((block, index) => {
            const baseY = -totalHeight / 2 + blocks.slice(0, index).reduce((sum, b) => sum + b.height, 0);
            return {
                block,
                baseY,
                topY: baseY + block.height,
            };
        });

        return (
            <group>
                {/* Elevation View */}
                {viewMode === 'elevation' && (
                    <group position-z={depth / 2}>
                        <Line
                            points={[
                                [-width / 2 - 200, -(totalHeight / 2 + floorHeight), 0],
                                [width / 2 + 200, -(totalHeight / 2 + floorHeight), 0],
                            ]}
                            color="#000000"
                            lineWidth={3}
                        />
                        <DimensionLayout start={[-width / 2, totalHeight / 2, 0]} end={[width / 2, totalHeight / 2, 0]} label={`${width}`} dir="h" offset={mainOffset} fontS={FONT_SIZE} />
                        <DimensionLayout start={[-width / 2, cabinetTopY, 0]} end={[-width / 2, baseBottomY, 0]} label={`${totalWithBase}`} dir="v" offset={outerOffset} fontS={FONT_SIZE} />
                        {baseHeight > 0 && (
                            <DimensionLayout start={[-width / 2, cabinetBottomY, 0]} end={[-width / 2, baseBottomY, 0]} label={`${baseHeight}`} dir="v" offset={middleOffset} fontS={FONT_SIZE} />
                        )}
                        {blockBounds.map(({ block, baseY, topY }) => (
                            <DimensionLayout
                                key={`block-height-${block.id}`}
                                start={[-width / 2, topY, 0]}
                                end={[-width / 2, baseY, 0]}
                                label={`${block.height}`}
                                dir="v"
                                offset={middleOffset}
                                fontS={FONT_SIZE}
                                textOutside={Math.abs(topY - baseY) < minLabelSpan}
                            />
                        ))}
                        {blockBounds.map(({ block, baseY, topY }) => {
                            if (block.useDrawers) {
                                const cellHeight = block.height / block.numRows;
                                return Array.from({ length: block.numRows }).map((_, idx) => {
                                    const startY = baseY + cellHeight * idx;
                                    const endY = startY + cellHeight;
                                    const span = Math.abs(endY - startY);
                                    const showLabel = span >= minLabelSpan || idx % 2 === 0;
                                    if (!showLabel) return null;
                                    return (
                                        <DimensionLayout
                                            key={`drawer-dim-elev-${block.id}-${idx}`}
                                            start={[-width / 2, endY, 0]}
                                            end={[-width / 2, startY, 0]}
                                            label={`${Math.round(cellHeight)}`}
                                            dir="v"
                                            offset={mainOffset}
                                            fontS={FONT_SIZE}
                                            textOutside={span < minLabelSpan}
                                            textShift={idx % 2 === 0 ? -FONT_SIZE * 0.4 : FONT_SIZE * 0.4}
                                        />
                                    );
                                });
                            }

                            if (block.useTrunk) {
                                const lidHeight = Math.max(0, Math.min(block.lidHeight, block.height));
                                const bodyHeight = block.height - lidHeight;
                                if (lidHeight <= 0 || bodyHeight <= 0) return null;
                                const bodyTopY = baseY + bodyHeight;
                                return (
                                    <DimensionLayout
                                        key={`lid-dim-elev-${block.id}`}
                                        start={[-width / 2, topY, 0]}
                                        end={[-width / 2, bodyTopY, 0]}
                                        label={`${Math.round(lidHeight)}`}
                                        dir="v"
                                        offset={mainOffset}
                                        fontS={FONT_SIZE}
                                        textOutside={Math.abs(topY - bodyTopY) < minLabelSpan}
                                    />
                                );
                            }

                            if (!block.useTrunk && block.numShelves > 0) {
                                const shelves = getShelvesForBlock(block.height, block.numShelves);
                                return Array.from({ length: block.numShelves + 1 }).map((_, idx) => {
                                    const prevY = idx === 0 ? (baseY + PANEL_THICKNESS / 2) : baseY + block.height / 2 + shelves[idx - 1];
                                    const currentY = idx === block.numShelves ? (baseY + block.height - PANEL_THICKNESS / 2) : baseY + block.height / 2 + shelves[idx];
                                    const space = Math.round(currentY - prevY);
                                    const span = Math.abs(currentY - prevY);
                                    const showLabel = span >= minLabelSpan || idx % 2 === 0;
                                    if (!showLabel) return null;

                                    return (
                                        <DimensionLayout
                                            key={`shelf-dim-elev-${block.id}-${idx}`}
                                            start={[-width / 2, currentY, 0]}
                                            end={[-width / 2, prevY, 0]}
                                            label={`${space}`}
                                            dir="v"
                                            offset={mainOffset}
                                            fontS={FONT_SIZE}
                                            textOutside={span < minLabelSpan}
                                            textShift={idx % 2 === 0 ? -FONT_SIZE * 0.4 : FONT_SIZE * 0.4}
                                        />
                                    );
                                });
                            }

                            return null;
                        })}
                    </group>
                )}

                {/* Plan View (Looking down with up=[0,0,-1]) */}
                {viewMode === 'plan' && (
                    <group position-y={totalHeight / 2} rotation-x={-Math.PI / 2}>
                        {/* Width on TOP (Anchored at Back: depth/2) */}
                        <DimensionLayout start={[-width / 2, depth / 2, 0]} end={[width / 2, depth / 2, 0]} label={`${width}`} dir="h" offset={mainOffset} fontS={FONT_SIZE} />
                        {/* Depth on LEFT */}
                        <DimensionLayout start={[-width / 2, depth / 2, 0]} end={[-width / 2, -depth / 2, 0]} label={`${depth}`} dir="v" offset={mainOffset} fontS={FONT_SIZE} />
                    </group>
                )}

                {/* Section View */}
                {viewMode === 'section' && (
                    <group rotation-y={Math.PI / 2} position-x={width / 2}>
                        <Line
                            points={[
                                [-depth / 2 - 200, -(totalHeight / 2 + floorHeight), 0],
                                [depth / 2 + 200, -(totalHeight / 2 + floorHeight), 0],
                            ]}
                            color="#000000"
                            lineWidth={3}
                        />
                        {/* Overall Depth (TOP) */}
                        <DimensionLayout start={[-depth / 2, cabinetTopY, 0]} end={[depth / 2, cabinetTopY, 0]} label={`${depth}`} dir="h" offset={mainOffset} fontS={FONT_SIZE} />

                        {/* Overall Height (LEFT) */}
                        <DimensionLayout start={[-depth / 2, cabinetTopY, 0]} end={[-depth / 2, baseBottomY, 0]} label={`${totalWithBase}`} dir="v" offset={outerOffset} fontS={FONT_SIZE} />
                        {baseHeight > 0 && (
                            <DimensionLayout start={[-depth / 2, cabinetBottomY, 0]} end={[-depth / 2, baseBottomY, 0]} label={`${baseHeight}`} dir="v" offset={middleOffset} fontS={FONT_SIZE} />
                        )}
                        {blockBounds.map(({ block, baseY, topY }) => (
                            <DimensionLayout
                                key={`block-height-section-${block.id}`}
                                start={[-depth / 2, topY, 0]}
                                end={[-depth / 2, baseY, 0]}
                                label={`${block.height}`}
                                dir="v"
                                offset={middleOffset}
                                fontS={FONT_SIZE}
                                textOutside={Math.abs(topY - baseY) < minLabelSpan}
                            />
                        ))}

                        {/* Shelf spaces (LEFT string) - MEASURED TO CENTER LINES */}
                        {blockBounds.map(({ block, baseY, topY }) => {
                            if (block.useDrawers) {
                                const cellHeight = block.height / block.numRows;
                                return Array.from({ length: block.numRows }).map((_, idx) => {
                                    const startY = baseY + cellHeight * idx;
                                    const endY = startY + cellHeight;
                                    const span = Math.abs(endY - startY);
                                    const showLabel = span >= minLabelSpan || idx % 2 === 0;
                                    if (!showLabel) return null;
                                    return (
                                        <DimensionLayout
                                            key={`drawer-dim-section-${block.id}-${idx}`}
                                            start={[-depth / 2, endY, 0]}
                                            end={[-depth / 2, startY, 0]}
                                            label={`${Math.round(cellHeight)}`}
                                            dir="v"
                                            offset={mainOffset}
                                            fontS={FONT_SIZE}
                                            textOutside={span < minLabelSpan}
                                            textShift={idx % 2 === 0 ? -FONT_SIZE * 0.4 : FONT_SIZE * 0.4}
                                        />
                                    );
                                });
                            }

                            if (block.useTrunk) {
                                const lidHeight = Math.max(0, Math.min(block.lidHeight, block.height));
                                const bodyHeight = block.height - lidHeight;
                                if (lidHeight <= 0 || bodyHeight <= 0) return null;
                                const bodyTopY = baseY + bodyHeight;
                                return (
                                    <DimensionLayout
                                        key={`lid-dim-section-${block.id}`}
                                        start={[-depth / 2, topY, 0]}
                                        end={[-depth / 2, bodyTopY, 0]}
                                        label={`${Math.round(lidHeight)}`}
                                        dir="v"
                                        offset={mainOffset}
                                        fontS={FONT_SIZE}
                                        textOutside={Math.abs(topY - bodyTopY) < minLabelSpan}
                                    />
                                );
                            }

                            if (!block.useTrunk && block.numShelves > 0) {
                                const shelves = getShelvesForBlock(block.height, block.numShelves);
                                return Array.from({ length: block.numShelves + 1 }).map((_, idx) => {
                                    const prevY = idx === 0 ? (baseY + PANEL_THICKNESS / 2) : baseY + block.height / 2 + shelves[idx - 1];
                                    const currentY = idx === block.numShelves ? (baseY + block.height - PANEL_THICKNESS / 2) : baseY + block.height / 2 + shelves[idx];
                                    const space = Math.round(currentY - prevY);
                                    const span = Math.abs(currentY - prevY);
                                    const showLabel = span >= minLabelSpan || idx % 2 === 0;
                                    if (!showLabel) return null;

                                    return (
                                        <DimensionLayout
                                            key={`shelf-dim-section-${block.id}-${idx}`}
                                            start={[-depth / 2, currentY, 0]}
                                            end={[-depth / 2, prevY, 0]}
                                            label={`${space}`}
                                            dir="v"
                                            offset={mainOffset}
                                            fontS={FONT_SIZE}
                                            textOutside={span < minLabelSpan}
                                            textShift={idx % 2 === 0 ? -FONT_SIZE * 0.4 : FONT_SIZE * 0.4}
                                        />
                                    );
                                });
                            }

                            return null;
                        })}
                    </group>
                )}
            </group>
        );
    };

    return (
        <group position-y={totalHeight / 2 + floorHeight}>
            {!isTech && (
                <ContactShadows
                    opacity={0.8}
                    scale={4000}
                    blur={0.5}
                    resolution={1024}
                    position={[0, -(totalHeight / 2 + floorHeight), 0]} // Anchor to World Floor (Y=0)
                    far={totalHeight + floorHeight + 200} // Ensure capture depth covers the floating cabinet
                />
            )}

            {blocks.map((block, blockIndex) => {
                const blockBaseY = -totalHeight / 2 + blocks.slice(0, blockIndex).reduce((sum, b) => sum + b.height, 0);
                const blockCenterY = blockBaseY + block.height / 2;
                const shelves = getShelvesForBlock(block.height, block.numShelves);

                return (
                    <group key={block.id} position-y={blockCenterY}>
                        {!block.useTrunk && (
                            <>
                                <mesh position={[-width / 2 + PANEL_THICKNESS / 2, 0, 0]} castShadow receiveShadow>
                                    <boxGeometry args={[PANEL_THICKNESS, block.height, depth]} />
                                    {currentAccent}
                                    <EdgeOverlay />
                                </mesh>
                                {!hideSidePanel && (
                                    <mesh position={[width / 2 - PANEL_THICKNESS / 2, 0, 0]} castShadow receiveShadow>
                                        <boxGeometry args={[PANEL_THICKNESS, block.height, depth]} />
                                        {currentAccent}
                                        <EdgeOverlay />
                                    </mesh>
                                )}
                                <mesh position={[0, block.height / 2 - PANEL_THICKNESS / 2, 0]} castShadow receiveShadow>
                                    <boxGeometry args={[width - 2 * PANEL_THICKNESS, PANEL_THICKNESS, depth]} />
                                    {currentAccent}
                                    <EdgeOverlay />
                                </mesh>
                                <mesh position={[0, -block.height / 2 + PANEL_THICKNESS / 2, 0]} castShadow receiveShadow>
                                    <boxGeometry args={[width - 2 * PANEL_THICKNESS, PANEL_THICKNESS, depth]} />
                                    {currentAccent}
                                    <EdgeOverlay />
                                </mesh>
                                <mesh position={[0, 0, -depth / 2 + PANEL_THICKNESS / 2]} castShadow receiveShadow>
                                    <boxGeometry args={[width, block.height, PANEL_THICKNESS]} />
                                    {currentAccent}
                                    <EdgeOverlay />
                                </mesh>
                            </>
                        )}

                        {/* Shelves */}
                        {!block.useDrawers && !block.useTrunk && shelves.map((y, idx) => (
                            <mesh key={`shelf-${block.id}-${idx}`} position={[0, y, 0]} castShadow receiveShadow>
                                <boxGeometry args={[width - 2 * PANEL_THICKNESS, PANEL_THICKNESS, depth - 20]} />
                                {currentMaterial}
                                <EdgeOverlay />
                            </mesh>
                        ))}

                        {/* Doors */}
                        {block.useDoors && viewMode !== 'section' && block.numRows > 0 && block.numCols > 0 && Array.from({ length: block.numRows }).map((_, row) => {
                            const cellHeight = block.height / block.numRows;
                            const centerY = -block.height / 2 + cellHeight / 2 + cellHeight * row;

                            return Array.from({ length: block.numCols }).map((_, col) => {
                                const cellWidth = width / block.numCols;
                                const centerX = -width / 2 + cellWidth / 2 + cellWidth * col;
                                const isRightHinge = col % 2 !== 0;
                                const pivotX = isRightHinge ? centerX + cellWidth / 2 : centerX - cellWidth / 2;
                                const meshOffsetX = isRightHinge ? -cellWidth / 2 : cellWidth / 2;

                                return (
                                    <AnimatedDoor
                                        key={`door-${block.id}-${row}-${col}`}
                                        position={[pivotX, centerY, depth / 2 + DOOR_THICKNESS / 2]}
                                        args={[cellWidth - 2, cellHeight - 2, DOOR_THICKNESS]}
                                        hinge={isRightHinge ? 'right' : 'left'}
                                        isOpen={block.doorsOpen}
                                        meshOffset={[meshOffsetX, 0, 0]}
                                        isTech={isTech}
                                        color={cabinetColor}
                                        viewMode={viewMode}
                                    />
                                );
                            });
                        })}

                        {/* Drawers */}
                        {block.useDrawers && block.numRows > 0 && block.numCols > 0 && Array.from({ length: block.numRows }).map((_, row) => {
                            const drawerGap = 2;
                            const cellHeight = block.height / block.numRows;
                            const drawerFaceHeight = cellHeight - drawerGap;
                            const centerY = -block.height / 2 + cellHeight / 2 + cellHeight * row;
                            const isBottomRow = row === 0;

                            return Array.from({ length: block.numCols }).map((_, col) => {
                                const cellWidth = width / block.numCols;
                                const centerX = -width / 2 + cellWidth / 2 + cellWidth * col;
                                const handleOffsetX = cellWidth / 5;

                                const drawerKey = `drawer-${block.id}-${row}-${col}`;

                                if (isTech && viewMode === 'section') {
                                    if (col !== 0) return null;
                                    const yTop = centerY + drawerFaceHeight / 2;
                                    const yBottom = centerY - drawerFaceHeight / 2;
                                    const zFront = depth / 2 - PANEL_THICKNESS;
                                    const zBack = -depth / 2 + PANEL_THICKNESS;

                                    return (
                                        <group key={drawerKey}>
                                            <Line
                                                points={[
                                                    [0, yBottom, zFront],
                                                    [0, yTop, zFront],
                                                    [0, yTop, zBack],
                                                    [0, yBottom, zBack],
                                                    [0, yBottom, zFront],
                                                ]}
                                                color="black"
                                                lineWidth={1}
                                            />
                                            <mesh position={[0, centerY, depth / 2 + DOOR_THICKNESS / 2 + 8]}>
                                                <sphereGeometry args={[8]} />
                                                <meshBasicMaterial color="black" />
                                            </mesh>
                                        </group>
                                    );
                                }

                                return (
                                    <DrawerAssembly
                                        key={drawerKey}
                                        position={[centerX, centerY, depth / 2 + DOOR_THICKNESS / 2]}
                                        faceWidth={cellWidth - 2}
                                        faceHeight={drawerFaceHeight}
                                        depth={depth}
                                        handleOffsetX={handleOffsetX}
                                        isTech={isTech}
                                        viewMode={viewMode}
                                        material={currentMaterial}
                                        accent={currentAccent}
                                        openDrawer={!isTech && block.drawersOpen && isBottomRow}
                                    />
                                );
                            });
                        })}

                        {/* Trunk */}
                        {block.useTrunk && (() => {
                            const lidHeight = Math.max(0, block.lidHeight);
                            const bodyHeight = getTrunkBodyHeight(block.height, lidHeight);
                            const bodyY = -block.height / 2 + bodyHeight / 2;
                            const bodyTopY = -block.height / 2 + bodyHeight;
                            const lidY = bodyTopY + lidHeight / 2;

                            return (
                                <group>
                                    {/* Body panels */}
                                    <mesh position={[0, bodyY - bodyHeight / 2 + PANEL_THICKNESS / 2, 0]} castShadow receiveShadow>
                                        <boxGeometry args={[width - 2 * PANEL_THICKNESS, PANEL_THICKNESS, depth]} />
                                        {currentAccent}
                                        <EdgeOverlay />
                                    </mesh>
                                    <mesh position={[-width / 2 + PANEL_THICKNESS / 2, bodyY, 0]} castShadow receiveShadow>
                                        <boxGeometry args={[PANEL_THICKNESS, bodyHeight, depth]} />
                                        {currentAccent}
                                        <EdgeOverlay />
                                    </mesh>
                                    {!hideSidePanel && (
                                        <mesh position={[width / 2 - PANEL_THICKNESS / 2, bodyY, 0]} castShadow receiveShadow>
                                            <boxGeometry args={[PANEL_THICKNESS, bodyHeight, depth]} />
                                            {currentAccent}
                                            <EdgeOverlay />
                                        </mesh>
                                    )}
                                    <mesh position={[0, bodyY, depth / 2 - PANEL_THICKNESS / 2]} castShadow receiveShadow>
                                        <boxGeometry args={[width, bodyHeight, PANEL_THICKNESS]} />
                                        {currentAccent}
                                        <EdgeOverlay />
                                    </mesh>
                                    <mesh position={[0, bodyY, -depth / 2 + PANEL_THICKNESS / 2]} castShadow receiveShadow>
                                        <boxGeometry args={[width, bodyHeight, PANEL_THICKNESS]} />
                                        {currentAccent}
                                        <EdgeOverlay />
                                    </mesh>

                                    {/* Lid */}
                                    <AnimatedLid
                                        width={width}
                                        depth={depth}
                                        lidHeight={lidHeight}
                                        position={[0, bodyTopY, -depth / 2]}
                                        isOpen={block.lidOpen}
                                        isTech={isTech}
                                        viewMode={viewMode}
                                        material={currentAccent}
                                    />
                                </group>
                            );
                        })()}
                    </group>
                );
            })}

            {/* Skirting */}
            {showSkirting && floorHeight > 0 && (
                <mesh position={[0, -totalHeight / 2 - floorHeight / 2, recessDistance / 2]} castShadow receiveShadow>
                    <boxGeometry args={[width, floorHeight, depth - recessDistance]} />
                    {currentAccent}
                    <EdgeOverlay />
                </mesh>
            )}

            {/* Feet */}
            {feet.map((pos, idx) => (
                <mesh key={`foot-${idx}`} position={pos} castShadow receiveShadow>
                    <cylinderGeometry args={[15, 15, floorHeight, 16]} />
                    {isTech ? techMaterial : <meshStandardMaterial color={cabinetColor} roughness={0.6} />}
                    <EdgeOverlay />
                </mesh>
            ))}

            <ShowDimensions />
        </group>
    );
};

// New component for drawing the door swing arc
const DoorSwingArc = ({ hinge, width }: { hinge: 'left' | 'right', width: number }) => {
    // Arc logic:
    // Hinge Left: Arc starts at (width, 0) relative to pivot, goes to (0, width). 
    // Pivot is at (0,0,0) in local space of the group?
    // AnimatedDoor is a group at 'position' (pivot).
    // Mesh is offset by 'meshOffset'.
    // We want the arc to be static relative to the *pivot*, NOT rotating with the door.
    // So we should place it outside the `animated.group` if possible?
    // OR we place it inside `animated.group` but rotate it inversely?
    // No, cleaner to place it as sibling or parent. But AnimatedDoor encapsulates the door.
    // Wait, the user wants the arc visible when 'doorsOpen' is true?
    // Actually standard drafting creates the arc from closed to open.
    // So it should be static in the Cabinet frame, but positioned at the pivot.
    // Let's modify AnimatedDoor to accept a "showArc" prop?
    // Or render it inside AnimatedDoor but outside the rotation group?

    // Let's render it inside AnimatedDoor but wrap the door mesh in the animated group, 
    // and keep the arc static in the root of AnimatedDoor (which is positioned at pivot).

    const radius = width;
    const segments = 20;
    const points = [];

    // Plan view: X is horizontal, Z is vertical (Top is -Z).
    // Door closed lies along X axis relative to pivot.
    // Open door lies along Z axis relative to pivot.
    // Left Hinge: Pivot on Left. Door goes +X (Closed). Swings to +Z (Open).
    // Right Hinge: Pivot on Right. Door goes -X (Closed). Swings to +Z (Open).

    for (let i = 0; i <= segments; i++) {
        const theta = (Math.PI / 2) * (i / segments);
        if (hinge === 'left') {
            // Start at (r, 0) -> End at (0, r)
            // x = r * cos(theta)
            // z = r * sin(theta)
            points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
        } else {
            // Start at (-r, 0) -> End at (0, r)
            // x = -r * cos(theta)
            // z = r * sin(theta)
            points.push(new THREE.Vector3(-radius * Math.cos(theta), 0, radius * Math.sin(theta)));
        }
    }

    return (
        <Line
            points={points}
            color="black"
            lineWidth={1}
            dashed={true}
            dashScale={1}
            dashSize={12}
            gapSize={12}
        />
    );
};

const AnimatedDoor = ({ position, args, hinge, isOpen, meshOffset, isTech, color, viewMode }: any) => {
    // Open OUTWARD 
    const { rot } = useSpring({
        rot: isOpen ? (hinge === 'left' ? -Math.PI / 2 : Math.PI / 2) : 0,
        config: { mass: 1, tension: 120, friction: 14 }
    });

    const doorWidth = args[0]; // width is args[0]

    return (
        <group position={position}>
            {/* Static Arc for Plan View */}
            {isTech && viewMode === 'plan' && isOpen && (
                <DoorSwingArc hinge={hinge} width={doorWidth} />
            )}

            <animated.group rotation-y={rot}>
                <mesh position={meshOffset} castShadow receiveShadow>
                    <boxGeometry args={args} />
                    {isTech ?
                        <meshBasicMaterial color="white" polygonOffset polygonOffsetFactor={2} /> :
                        <meshStandardMaterial color={color} roughness={0.6} />
                    }
                    {isTech && <Edges color="black" threshold={10} />}
                    {(!isTech || viewMode === 'elevation') && (
                        <mesh position={[hinge === 'left' ? args[0] / 2 - 30 : -args[0] / 2 + 30, 0, args[2] / 2 + 8]}>
                            <sphereGeometry args={[8]} />
                            {isTech ? <meshBasicMaterial color="black" /> : <meshStandardMaterial color="silver" />}
                        </mesh>
                    )}
                </mesh>
            </animated.group>
        </group>
    );
};

const AnimatedLid = ({ width, depth, lidHeight, position, isOpen, isTech, viewMode, material }: any) => {
    const { rot } = useSpring({
        rot: isOpen ? -Math.PI / 2 : 0,
        config: { mass: 1, tension: 120, friction: 14 }
    });

    if (lidHeight <= 0) return null;

    const arcRadius = depth;
    const arcSegments = 20;
    const arcPoints = [];
    for (let i = 0; i <= arcSegments; i++) {
        const theta = (Math.PI / 2) * (i / arcSegments);
        arcPoints.push(new THREE.Vector3(0, arcRadius * Math.sin(theta), arcRadius * Math.cos(theta)));
    }

    return (
        <group position={position}>
            {isTech && viewMode === 'section' && isOpen && (
                <Line
                    points={arcPoints}
                    color="black"
                    lineWidth={1}
                    dashed={true}
                    dashScale={1}
                    dashSize={12}
                    gapSize={12}
                />
            )}
            <animated.group rotation-x={rot}>
                <mesh position={[0, lidHeight / 2, depth / 2]} castShadow receiveShadow>
                    <boxGeometry args={[width, lidHeight, depth]} />
                    {isTech ? <meshBasicMaterial color="white" polygonOffset polygonOffsetFactor={2} /> : material}
                    {isTech && <Edges color="black" threshold={10} />}
                </mesh>
            </animated.group>
        </group>
    );
};

const DrawerAssembly = ({ position, faceWidth, faceHeight, depth, handleOffsetX, isTech, viewMode, material, accent, openDrawer }: any) => {
    const { z } = useSpring({
        z: openDrawer ? (depth * 2) / 3 : 0,
        config: { mass: 1, tension: 120, friction: 14 }
    });

    const innerWidth = Math.max(1, faceWidth - 2 * PANEL_THICKNESS);
    const drawerDepth = Math.max(1, depth - 2 * PANEL_THICKNESS);
    const drawerBoxHeight = Math.max(1, faceHeight - PANEL_THICKNESS);

    const [baseX, baseY, baseZ] = position;

    const handlePositions = faceWidth <= 600
        ? [0]
        : [-(faceWidth / 2 - faceWidth / 5), (faceWidth / 2 - faceWidth / 5)];

    return (
        <animated.group position={z.to((val) => [baseX, baseY, baseZ + val])}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[faceWidth, faceHeight, DOOR_THICKNESS]} />
                {material}
                {isTech && <Edges color="black" threshold={10} />}
            </mesh>
            {(!isTech || viewMode === 'elevation') && (
                <>
                    {handlePositions.map((x, idx) => (
                        <mesh key={`drawer-handle-${idx}`} position={[x, 0, DOOR_THICKNESS / 2 + 8]}>
                            <sphereGeometry args={[8]} />
                            {isTech ? <meshBasicMaterial color="black" /> : <meshStandardMaterial color="silver" />}
                        </mesh>
                    ))}
                </>
            )}
            {!isTech && openDrawer && (
                <group position={[0, 0, -drawerDepth / 2]}>
                    <mesh position={[0, -drawerBoxHeight / 2 + PANEL_THICKNESS / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[innerWidth, PANEL_THICKNESS, drawerDepth]} />
                        {accent}
                    </mesh>
                    <mesh position={[-innerWidth / 2 - PANEL_THICKNESS / 2, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[PANEL_THICKNESS, drawerBoxHeight, drawerDepth]} />
                        {accent}
                    </mesh>
                    <mesh position={[innerWidth / 2 + PANEL_THICKNESS / 2, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[PANEL_THICKNESS, drawerBoxHeight, drawerDepth]} />
                        {accent}
                    </mesh>
                    <mesh position={[0, 0, -drawerDepth / 2 + PANEL_THICKNESS / 2]} castShadow receiveShadow>
                        <boxGeometry args={[innerWidth, drawerBoxHeight, PANEL_THICKNESS]} />
                        {accent}
                    </mesh>
                </group>
            )}
        </animated.group>
    );
};
