import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// const pmremGenerator = new THREE.PMREMGenerator( renderer );

scene.background = new THREE.Color(0xbfe3dd);
//scene.environment = pmremGenerator.fromScene( new RoomEnvironment( renderer ), 0.04 ).texture;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 10;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
// groundGeometry.rotateX(-Math.PI / 2);
// const groundMaterial = new THREE.MeshStandardMaterial({
//   color: 0x555555,
//   side: THREE.DoubleSide
// });
// const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
// groundMesh.castShadow = false;
// groundMesh.receiveShadow = true;
// scene.add(groundMesh);

function setupLighting() {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.castShadow = true;
  directionalLight.position.set(5, 5, 5);
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);
  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  // scene.add(ambientLight);

  // const fillLight = new THREE.DirectionalLight(0xffffff, 2);
  // fillLight.position.set(-5, 3, -5);
  // scene.add(fillLight);

  // const pointLight = new THREE.PointLight(0xffffff, 1, 10);
  // pointLight.position.set(0, 3, 0);
  // scene.add(pointLight);
}
setupLighting();

let currentModel = 1;
let currentUrl = null;
function setModelSize(model, targetSize) {
  if (!model) return;

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetSize / maxDim;

  model.scale.set(scale, scale, scale);
}

function loadModel(modelPath, targetSize = 0.7) {
  // Remove current model if it exists
  if (currentModel) {
    scene.remove(currentModel);
  }

  // Show progress container
  document.getElementById('progress-container').style.display = 'block';
  // Load new model
  const loader = new GLTFLoader().setPath('public/models/');
  loader.load(modelPath, (gltf) => {
    currentModel = gltf.scene;
    currentModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    currentModel.position.set(0, 1.05, -1);
    setModelSize(currentModel, targetSize);
    scene.add(currentModel);
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Set camera position based on bounding box
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 0; // Zoom out a little so object fits comfortably in view

    camera.position.set(center.x, center.y, center.z + cameraZ);

    // Update controls target to center of the model
    controls.target.set(center.x, center.y, center.z);
    controls.update();

    document.getElementById('progress-container').style.display = 'none';
  }, (xhr) => {
    console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
  }, (error) => {
    console.error(error);
    document.getElementById('progress-container').style.display = 'none';
  });
}
// function openAR(modelUrl, usdzUrl) {
//   const isAndroid = /Android/i.test(navigator.userAgent);
//   const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;

//   if (isAndroid) {
//     // For Android, we need to use the full URL
//     const fullUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + modelUrl;
//     window.location.href = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(fullUrl)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
//   } else if (isIOS) {
//     // For iOS, we'll use the USDZ file directly
//     const arLink = document.createElement('a');
//     arLink.setAttribute('rel', 'ar');
//     arLink.setAttribute('href', usdzUrl);
//     arLink.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==" alt="AR">';

//     document.body.appendChild(arLink);
//     arLink.click();

//     setTimeout(() => {
//       document.body.removeChild(arLink);
//     }, 1000);
//   } else {
//     console.log("AR viewer is not available on this device.");
//     alert("AR viewer is not available on this device. You can view the model in 3D instead.");
//     // Implement fallback 3D viewer here
//   }
// }
function changeModel(modelNumber) {
  const modelPath = `${modelNumber}.glb`;
  currentUrl = modelNumber;
  loadModel(modelPath);
  return currentUrl;
}
// function openUniversalLink(url, usdzUrl) {
//   var LibraryManager = {
//     library: {}
// };

// mergeInto(LibraryManager.library, {
//     OpenUniversalLink: function(url, usdzUrl) {
//         var modelUrl = UTF8ToString(url);
//         var usdzPath = UTF8ToString(usdzUrl);
//         var isAndroid = /Android/i.test(navigator.userAgent);
//         var isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent)  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;

//         if (isAndroid) {
//             // For Android, we need to use the full URL
//             var fullUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + modelUrl;
//             window.location.href = "intent://arvr.google.com/scene-viewer/1.0?file=" + encodeURIComponent(fullUrl) + "#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;";
//         } else if (isIOS) {
//             // For iOS, we'll use the USDZ file directly
//             var arLink = document.createElement('a');
//             arLink.setAttribute('rel', 'ar');
//             arLink.setAttribute('href', usdzPath);
//             arLink.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==" alt="AR">';

//             document.body.appendChild(arLink);
//             console.log("AR link appended to body");
//             arLink.click();
//             console.log("AR link clicked");

//             setTimeout(function() {
//                 document.body.removeChild(arLink);
//                 console.log("AR link removed");
//             }, 1000);
//         } else if((navigator.userAgent.includes('HUAWEI') || navigator.userAgent.includes('Huawei'))){
//             if (this.checkHarmonyOSFeatures()) {
//                 return true;}
//         }
//         else{
//             console.log("AR viewer is not available on this device.");
//             alert("AR viewer is not available on this device. You can view the model in 3D instead.");
//             // Implement fallback 3D viewer here

//         }

// }
// });
// }
function openUniversalLink(modelUrl, usdzUrl) {
  var isAndroid = /Android/i.test(navigator.userAgent);
  var isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;

  if (isAndroid) {
    // For Android, we need to use the full URL
    var fullUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + modelUrl;
    window.location.href = "intent://arvr.google.com/scene-viewer/1.0?file=" + encodeURIComponent(fullUrl) + "#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;";
  } else if (isIOS) {
    // For iOS, we'll use the USDZ file directly
    var arLink = document.createElement('a');
    arLink.setAttribute('rel', 'ar');
    arLink.setAttribute('href', usdzUrl);
    arLink.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==" alt="AR">';

    document.body.appendChild(arLink);
    console.log("AR link appended to body");
    arLink.click();
    console.log("AR link clicked");

    setTimeout(function () {
      document.body.removeChild(arLink);
      console.log("AR link removed");
    }, 1000);
  } else if ((navigator.userAgent.includes('HUAWEI') || navigator.userAgent.includes('Huawei'))) {
    if (checkHarmonyOSFeatures()) {
      return true;
    }
  } else {
    console.log("AR viewer is not available on this device.");
    alert("AR viewer is not available on this device. You can view the model in 3D instead.");
    // Implement fallback 3D viewer here
  }
}
// function UTF8ToString(ptr) {
//   return ptr;  // This is a simplification. In a real environment, you'd use the actual UTF8ToString function
// }
// function mergeInto(obj1, obj2) {
//   for (var key in obj2) {
//       if (obj2.hasOwnProperty(key)) {
//           obj1[key] = obj2[key];
//       }
//   }
// }

// function startAR() {
//   const modelUrl = `${currentUrl}.glb`;
//   const usdzUrl = `${currentUrl}.usdz`;
//   //openUniversalLink.LibraryManager.library.OpenUniversalLink(modelUrl, usdzUrl);
//   openUniversalLink(modelUrl, usdzUrl);
// }



// Set up button listeners
function openAR() {
  const modelUrl = `${currentUrl}.glb`;
  const usdzUrl = `${currentUrl}.usdz`;
  var isAndroid = /Android/i.test(navigator.userAgent);
  var isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;

  console.log("User Agent:", navigator.userAgent);
  console.log("isAndroid:", isAndroid);
  console.log("isIOS:", isIOS);

  if (isAndroid) {
    var fullUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + modelUrl;
    console.log("Android AR URL:", fullUrl);
    window.location.href = "intent://arvr.google.com/scene-viewer/1.0?file=" + encodeURIComponent(fullUrl) + "#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;";
  } else if (isIOS) {
    console.log("iOS AR URL:", usdzUrl);
    var arLink = document.createElement('a');
    arLink.setAttribute('rel', 'ar');
    arLink.setAttribute('href', usdzUrl);
    arLink.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==" alt="AR">';

    document.body.appendChild(arLink);
    arLink.click();

    setTimeout(function () {
      document.body.removeChild(arLink);
    }, 1000);
  } else if ((navigator.userAgent.includes('HUAWEI') || navigator.userAgent.includes('Huawei'))) {
    console.log("Huawei device detected, AR viewer logic not implemented.");
  } else {
    alert("AR viewer is not available on this device. You can view the model in 3D instead.");
  }
}
function startAR() {
  openAR();
}
document.getElementById('Onion Ring').addEventListener('click', () => changeModel(1));
document.getElementById('Salad').addEventListener('click', () => changeModel(2));
document.getElementById('Hamburger').addEventListener('click', () => changeModel(3));
document.getElementById('AR-btn').addEventListener('click', () => startAR());

document.getElementsByClassName('model').addEventListener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Load initial model
loadModel('1.glb', 0.7);