import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useStore } from '../store/useStore';
import { exportPDF } from '../utils/exporter';
import { exportGLB } from '../utils/glb';

export const Sidebar = () => {
    const {
        width, setWidth,
        depth, setDepth,
        floorHeight, setFloorHeight,
        cabinetColor, setCabinetColor,
        showSkirting, setShowSkirting,
        showFeet, setShowFeet,
        recessDistance, setRecessDistance,
        numFeetPerRow, setNumFeetPerRow,
        blocks,
        addBlock,
        removeBlock,
        updateBlock,
        setCabinetState,
        exportRoot,
    } = useStore();
    const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleBlock = (id: string) => {
        setCollapsedBlocks((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleExport = async () => {
        console.log('Export PDF Triggered');
        try {
            await exportPDF();
        } catch (e) {
            console.error('Export Failed', e);
            alert('Failed to export PDF. See console for details.');
        }
    };

    const handleSaveCabinet = () => {
        const payload = {
            width,
            depth,
            floorHeight,
            cabinetColor,
            showSkirting,
            showFeet,
            recessDistance,
            numFeetPerRow,
            blocks,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cabinet.cbt';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleLoadCabinet = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const shouldLoad = window.confirm('Loading will replace the current cabinet. Continue?');
        if (!shouldLoad) {
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string);
                if (!data || !Array.isArray(data.blocks)) {
                    throw new Error('Invalid cabinet file.');
                }
                setCabinetState(data);
            } catch (error) {
                console.error('Failed to load cabinet', error);
                alert('Failed to load cabinet file.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-top-pane">
                <h2>Cabinet Settings</h2>

                <div className="control-group">
                    <label>Width (mm)</label>
                    <div className="control-row">
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                        />
                        <input
                            type="range"
                            min={200}
                            max={3000}
                            step={10}
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="control-group">
                    <label>Depth (mm)</label>
                    <div className="control-row">
                        <input
                            type="number"
                            value={depth}
                            onChange={(e) => setDepth(Number(e.target.value))}
                        />
                        <input
                            type="range"
                            min={200}
                            max={2000}
                            step={10}
                            value={depth}
                            onChange={(e) => setDepth(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="control-group">
                    <label>Height from Floor (mm)</label>
                    <input
                        type="number"
                        value={floorHeight}
                        onChange={(e) => setFloorHeight(Number(e.target.value))}
                    />
                </div>

                <div className="control-group">
                    <div className="checkbox-row">
                        <input
                            type="checkbox"
                            id="showSkirting"
                            checked={showSkirting}
                            onChange={(e) => setShowSkirting(e.target.checked)}
                        />
                        <label htmlFor="showSkirting">Skirting</label>
                        <input
                            type="checkbox"
                            id="showFeet"
                            checked={showFeet}
                            onChange={(e) => setShowFeet(e.target.checked)}
                        />
                        <label htmlFor="showFeet">Feet</label>
                    </div>
                </div>

                <div className="control-group">
                    <div className="control-inline">
                        <label>Number of Feet Per Row</label>
                        <input
                            type="number"
                            min={2}
                            value={numFeetPerRow}
                            onChange={(e) => setNumFeetPerRow(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="control-group">
                    <div className="control-inline">
                        <label>Recess Distance (mm)</label>
                        <input
                            type="number"
                            min={0}
                            value={recessDistance}
                            onChange={(e) => setRecessDistance(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="control-group">
                    <div className="control-inline">
                        <label>Cabinet Color</label>
                        <input
                            type="color"
                            value={cabinetColor}
                            onChange={(e) => setCabinetColor(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-bottom-pane">
                <div className="blocks-header">
                    <h3>Blocks</h3>
                    <button className="add-block-btn" type="button" onClick={addBlock}>Add Block</button>
                </div>

                <div className="blocks-scroll">
                    {blocks.map((block, index) => {
                        const isCollapsed = collapsedBlocks[block.id];
                        const blockLabel = `Block ${index + 1}${index === 0 ? ' (Bottom)' : ''}`;

                        return (
                            <div className="block-card" key={block.id}>
                                <div className="block-card-header">
                                    <button
                                        className="block-toggle"
                                        type="button"
                                        onClick={() => toggleBlock(block.id)}
                                        aria-expanded={!isCollapsed}
                                        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${blockLabel}`}
                                    >
                                        <span className="chevron" aria-hidden="true">
                                            {isCollapsed ? '▸' : '▾'}
                                        </span>
                                        {blockLabel}
                                    </button>
                                    <button
                                        className="block-remove"
                                        type="button"
                                        onClick={() => removeBlock(block.id)}
                                        disabled={blocks.length === 1}
                                    >
                                        Remove
                                    </button>
                                </div>

                                {!isCollapsed && (
                                    <div className="block-card-body">
                                        <div className="control-group">
                                            <label>Height (mm)</label>
                                            <div className="control-row">
                                                <input
                                                    type="number"
                                                    value={block.height}
                                                    onChange={(e) => updateBlock(block.id, { height: Number(e.target.value) })}
                                                />
                                                <input
                                                    type="range"
                                                    min={200}
                                                    max={3000}
                                                    step={10}
                                                    value={block.height}
                                                    onChange={(e) => updateBlock(block.id, { height: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div className="control-group">
                                            <div className="checkbox-row">
                                                <input
                                                    type="checkbox"
                                                    id={`useDoors-${block.id}`}
                                                    checked={block.useDoors}
                                                    onChange={(e) =>
                                                        updateBlock(block.id, {
                                                            useDoors: e.target.checked,
                                                            useDrawers: e.target.checked ? false : block.useDrawers,
                                                            useTrunk: e.target.checked ? false : block.useTrunk,
                                                        })
                                                    }
                                                />
                                                <label htmlFor={`useDoors-${block.id}`}>Doors</label>
                                                <input
                                                    type="checkbox"
                                                    id={`useDrawers-${block.id}`}
                                                    checked={block.useDrawers}
                                                    onChange={(e) =>
                                                        updateBlock(block.id, {
                                                            useDrawers: e.target.checked,
                                                            useDoors: e.target.checked ? false : block.useDoors,
                                                            useTrunk: e.target.checked ? false : block.useTrunk,
                                                        })
                                                    }
                                                />
                                                <label htmlFor={`useDrawers-${block.id}`}>Drawers</label>
                                                <input
                                                    type="checkbox"
                                                    id={`useTrunk-${block.id}`}
                                                    checked={block.useTrunk}
                                                    onChange={(e) =>
                                                        updateBlock(block.id, {
                                                            useTrunk: e.target.checked,
                                                            useDoors: e.target.checked ? false : block.useDoors,
                                                            useDrawers: e.target.checked ? false : block.useDrawers,
                                                        })
                                                    }
                                                />
                                                <label htmlFor={`useTrunk-${block.id}`}>Trunk</label>
                                            </div>
                                        </div>

                                        {!block.useTrunk && (
                                            <div className="control-group">
                                                <div className="control-inline">
                                                    <label>Rows</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={block.numRows}
                                                        onChange={(e) => updateBlock(block.id, { numRows: Number(e.target.value) })}
                                                    />
                                                    <label>Columns</label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={block.numCols}
                                                        onChange={(e) => updateBlock(block.id, { numCols: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.useTrunk && (
                                            <div className="control-group">
                                                <div className="control-inline">
                                                    <label>Lid Height (mm)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={block.lidHeight}
                                                        onChange={(e) => updateBlock(block.id, { lidHeight: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {block.useDoors && (
                                            <div className="control-group checkbox-group">
                                                <input
                                                    type="checkbox"
                                                    id={`doorsOpen-${block.id}`}
                                                    checked={block.doorsOpen}
                                                    onChange={(e) => updateBlock(block.id, { doorsOpen: e.target.checked })}
                                                />
                                                <label htmlFor={`doorsOpen-${block.id}`}>Open Doors</label>
                                            </div>
                                        )}

                                        {block.useTrunk && (
                                            <div className="control-group checkbox-group">
                                                <input
                                                    type="checkbox"
                                                    id={`lidOpen-${block.id}`}
                                                    checked={block.lidOpen}
                                                    onChange={(e) => updateBlock(block.id, { lidOpen: e.target.checked })}
                                                />
                                                <label htmlFor={`lidOpen-${block.id}`}>Open Lid</label>
                                            </div>
                                        )}

                                        {block.useDrawers && (
                                            <div className="control-group checkbox-group">
                                                <input
                                                    type="checkbox"
                                                    id={`drawersOpen-${block.id}`}
                                                    checked={block.drawersOpen}
                                                    onChange={(e) => updateBlock(block.id, { drawersOpen: e.target.checked })}
                                                />
                                                <label htmlFor={`drawersOpen-${block.id}`}>Open Drawers</label>
                                            </div>
                                        )}

                                        {!block.useDrawers && !block.useTrunk && (
                                            <div className="control-group">
                                                <label>Number of Shelves</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={block.numShelves}
                                                    onChange={(e) => updateBlock(block.id, { numShelves: Number(e.target.value) })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="sidebar-actions-bar">
                    <div className="sidebar-actions">
                        <button className="export-btn" onClick={handleExport}>
                            Export PDF
                        </button>
                        <button className="secondary-btn" type="button" onClick={() => exportGLB(exportRoot)}>
                            Export GLB
                        </button>
                        <button className="secondary-btn" type="button" onClick={handleSaveCabinet}>
                            Save cabinet
                        </button>
                        <button className="secondary-btn" type="button" onClick={handleLoadCabinet}>
                            Load cabinet
                        </button>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".cbt"
                style={{ display: 'none' }}
                onChange={onFileChange}
            />
        </div>
    );
};
