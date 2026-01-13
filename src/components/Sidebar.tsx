import { useStore } from '../store/useStore';
import { exportPDF } from '../utils/exporter';

export const Sidebar = () => {
    const {
        width, setWidth,
        height, setHeight,
        depth, setDepth,
        numRows, setNumRows,
        numCols, setNumCols,
        doorsOpen, setDoorsOpen,
        useDoors, setUseDoors,
        useDrawers, setUseDrawers,
        numShelves, setNumShelves,
        floorHeight, setFloorHeight,
        cabinetColor, setCabinetColor,
        showSkirting, setShowSkirting,
        showFeet, setShowFeet,
        recessDistance, setRecessDistance,
        numFeetPerRow, setNumFeetPerRow,
    } = useStore();

    const handleExport = async () => {
        console.log("Export PDF Triggered");
        try {
            await exportPDF();
        } catch (e) {
            console.error("Export Failed", e);
            alert("Failed to export PDF. See console for details.");
        }
    };

    return (
        <div className="sidebar">
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

            <div className="control-group checkbox-group">
                <input
                    type="checkbox"
                    id="showSkirting"
                    checked={showSkirting}
                    onChange={(e) => setShowSkirting(e.target.checked)}
                />
                <label htmlFor="showSkirting">Skirting</label>
            </div>

            <div className="control-group checkbox-group">
                <input
                    type="checkbox"
                    id="showFeet"
                    checked={showFeet}
                    onChange={(e) => setShowFeet(e.target.checked)}
                />
                <label htmlFor="showFeet">Feet</label>
            </div>

            <div className="control-group">
                <label>Number of Feet Per Row</label>
                <input
                    type="number"
                    min={2}
                    value={numFeetPerRow}
                    onChange={(e) => setNumFeetPerRow(Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Recess Distance (mm)</label>
                <input
                    type="number"
                    min={0}
                    value={recessDistance}
                    onChange={(e) => setRecessDistance(Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Cabinet Color</label>
                <input
                    type="color"
                    value={cabinetColor}
                    onChange={(e) => setCabinetColor(e.target.value)}
                />
            </div>

            <div className="sidebar-divider" />

            <div className="control-group">
                <label>Height (mm)</label>
                <div className="control-row">
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                    />
                    <input
                        type="range"
                        min={200}
                        max={3000}
                        step={10}
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="control-group checkbox-group">
                <input
                    type="checkbox"
                    id="useDoors"
                    checked={useDoors}
                    onChange={(e) => setUseDoors(e.target.checked)}
                />
                <label htmlFor="useDoors">Doors</label>
            </div>

            <div className="control-group checkbox-group">
                <input
                    type="checkbox"
                    id="useDrawers"
                    checked={useDrawers}
                    onChange={(e) => setUseDrawers(e.target.checked)}
                />
                <label htmlFor="useDrawers">Drawers</label>
            </div>

            <div className="control-group">
                <label>Rows</label>
                <input
                    type="number"
                    min={1}
                    value={numRows}
                    onChange={(e) => setNumRows(Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Columns</label>
                <input
                    type="number"
                    min={1}
                    value={numCols}
                    onChange={(e) => setNumCols(Number(e.target.value))}
                />
            </div>

            {useDoors && (
                <div className="control-group checkbox-group">
                    <input
                        type="checkbox"
                        id="doorsOpen"
                        checked={doorsOpen}
                        onChange={(e) => setDoorsOpen(e.target.checked)}
                    />
                    <label htmlFor="doorsOpen">Open Doors</label>
                </div>
            )}

            {!useDrawers && (
                <div className="control-group">
                    <label>Number of Shelves</label>
                    <input
                        type="number"
                        min={0}
                        value={numShelves}
                        onChange={(e) => setNumShelves(Number(e.target.value))}
                    />
                </div>
            )}

            <button className="export-btn" onClick={handleExport}>
                Export PDF
            </button>
        </div>
    );
};
