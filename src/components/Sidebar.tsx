import { useStore } from '../store/useStore';
import { exportPDF } from '../utils/exporter';

export const Sidebar = () => {
    const {
        width, setWidth,
        height, setHeight,
        depth, setDepth,
        numDoors, setNumDoors,
        doorsOpen, setDoorsOpen,
        numShelves, setNumShelves,
        floorHeight, setFloorHeight,
        cabinetColor, setCabinetColor,
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
                <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Height (mm)</label>
                <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Depth (mm)</label>
                <input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                />
            </div>

            <div className="control-group">
                <label>Floor Height (mm)</label>
                <input
                    type="number"
                    value={floorHeight}
                    onChange={(e) => setFloorHeight(Number(e.target.value))}
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

            <div className="control-group">
                <label>Number of Doors</label>
                <input
                    type="number"
                    min={0}
                    value={numDoors}
                    onChange={(e) => setNumDoors(Number(e.target.value))}
                />
            </div>

            {numDoors > 0 && (
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

            <div className="control-group">
                <label>Number of Shelves</label>
                <input
                    type="number"
                    min={0}
                    value={numShelves}
                    onChange={(e) => setNumShelves(Number(e.target.value))}
                />
            </div>

            <button className="export-btn" onClick={handleExport}>
                Export PDF
            </button>
        </div>
    );
};
