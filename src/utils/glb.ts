import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import type * as THREE from 'three';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportGLB = (root: THREE.Object3D | null, filename = 'cabinet.glb') => {
  if (!root) {
    alert('Nothing to export yet.');
    return;
  }

  const sanitized = root.clone(true);
  sanitized.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (!material) return;
      material.map = null;
      material.emissiveMap = null;
      material.metalnessMap = null;
      material.roughnessMap = null;
      material.normalMap = null;
      material.aoMap = null;
      material.alphaMap = null;
      material.displacementMap = null;
      material.lightMap = null;
      material.envMap = null;
      material.needsUpdate = true;
    });
  });

  const exporter = new GLTFExporter();
  exporter.parse(
    sanitized,
    (result) => {
      if (result instanceof ArrayBuffer) {
        downloadBlob(new Blob([result], { type: 'model/gltf-binary' }), filename);
      }
    },
    (error) => {
      console.error('GLB export failed', error);
      alert('Failed to export GLB. See console for details.');
    },
    { binary: true }
  );
};
