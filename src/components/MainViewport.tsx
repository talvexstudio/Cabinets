import { View, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Cabinet } from './Cabinet';

export const MainViewport = () => {
    // const { floorHeight } = useStore(); // No longer needed here

    return (
        <View
            id="main-canvas"
            style={{ width: '100%', height: '100%', background: '#cccccc' }}
        >
            <color attach="background" args={['#cccccc']} />
            <OrbitControls makeDefault />
            <PerspectiveCamera makeDefault position={[2000, 2000, 2000]} fov={45} near={10} far={10000} />
            <ambientLight intensity={1.2} />
            <directionalLight
                position={[2500, 5000, 2500]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={100}
                shadow-camera-far={10000}
                shadow-camera-left={-2500}
                shadow-camera-right={2500}
                shadow-camera-top={2500}
                shadow-camera-bottom={-2500}
            />
            <pointLight position={[-2000, 3000, 1000]} intensity={0.5} />

            <Cabinet />

            {/* Grid at floor height 0 */}
            <gridHelper args={[5000, 50]} position={[0, 0, 0]} />

            {/* Ground plane for shadows */}
            <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[5000, 5000]} />
                <shadowMaterial opacity={0.3} />
            </mesh>
        </View>
    );
};
