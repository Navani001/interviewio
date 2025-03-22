export function createCCTVMarker() {
    const marker = document.createElement('div');
    marker.style.backgroundImage = 'url("./camera.png")';
    marker.style.width = '30px';
    marker.style.height = '30px';
    marker.style.backgroundSize = 'cover';
    return marker;
}
export function createCustomMarker() {
    const marker = document.createElement('div');
    marker.style.backgroundImage = 'url("./police.png")'; // Replace with your image URL
    marker.style.width = '25px';  // Adjust width
    marker.style.height = '25px'; // Adjust height
    marker.style.backgroundSize = 'cover';
    marker.style.borderRadius = '50%';  // Optional: Makes it circular
    return marker;
}