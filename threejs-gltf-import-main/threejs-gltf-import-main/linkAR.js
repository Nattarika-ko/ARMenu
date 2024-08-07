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
        
        setTimeout(function() {
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

function startAR() {
    var modelUrl = "model/saenD_Animat_finol_scale01.glb";  // For Android
    var usdzUrl = "model/saenD_taet02.usdz";  // For iOS
    
    openUniversalLink(modelUrl, usdzUrl);
}

document.getElementById('startButton').addEventListener('click', startAR);

function UTF8ToString(ptr) {
    return ptr;  // This is a simplification. In a real environment, you'd use the actual UTF8ToString function
}

function checkHarmonyOSFeatures() {
    // Implement the check for HarmonyOS features here
    // Return true if supported, false otherwise
    return false;
}
