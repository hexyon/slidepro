let images = [];
let imageElements = [];
let currentIndex = 0;
let slideshowInterval;
let random = false;
let loop = false;
let isFullscreen = false;
let isProgressBarVisible = false;

function handleFiles(files) {
    // Reset arrays
    images = [];
    imageElements = [];
    
    // Convert FileList to Array for easier handling
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    // Create a promise for each image load
    const imagePromises = fileArray.map(file => {
        return new Promise((resolve) => {
            const imageUrl = URL.createObjectURL(file);
            const img = new Image();
            
            img.onload = () => {
                resolve({ img, url: imageUrl });
            };
            
            img.src = imageUrl;
        });
    });

    // Wait for all images to load
    Promise.all(imagePromises).then(loadedImages => {
        loadedImages.forEach(({ img, url }) => {
            images.push(url);
            imageElements.push(img);
        });
        
        // After all images are loaded, update the display if needed
        if (slideshowInterval) {
            currentIndex = 0;
            updateSlideshow();
        }
    });
}

document.getElementById('start').addEventListener('click', function() {
    if (images.length === 0) return;
    this.dataset.state = 'on';
    document.getElementById('stop').dataset.state = 'off';
    startSlideshow();
});

document.getElementById('stop').addEventListener('click', function() {
    this.dataset.state = 'on';
    document.getElementById('start').dataset.state = 'off';
    stopSlideshow();
});

document.getElementById('random').addEventListener('click', function() {
    random = !random;
    this.dataset.state = random ? 'on' : 'off';
    if (random) shuffleImages();
    preloadImages();
});

document.getElementById('fullscreen').addEventListener('click', function() {
    let container = document.getElementById('fullscreen-container');
    if (!isFullscreen) {
        container.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

document.getElementById('loop').addEventListener('click', function() {
    loop = !loop;
    this.dataset.state = loop ? 'on' : 'off';
});

document.getElementById('progress').addEventListener('click', function() {
    isProgressBarVisible = !isProgressBarVisible;
    this.dataset.state = isProgressBarVisible ? 'on' : 'off';
    if (isFullscreen) {
        document.getElementById('progress-bar-container').style.display = isProgressBarVisible ? 'block' : 'none';
    }
});

function startSlideshow() {
    stopSlideshow();
    updateSlideshow(); // Show the first image immediately
    slideshowInterval = setInterval(function() {
        nextImage();
    }, document.getElementById('delay').value * 1000);
}

function stopSlideshow() {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
}

document.getElementById('delay').addEventListener('change', function() {
    if (slideshowInterval) startSlideshow();
});

function shuffleImages() {
    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }
}

function updateProgressBar() {
    if (isFullscreen && isProgressBarVisible) {
        let progressBar = document.getElementById('progress-bar');
        let progress = ((currentIndex + 1) / images.length) * 100;
        progressBar.style.width = progress + '%';
    }
}

function fadeOutSlideshow() {
    document.getElementById('slideshow').style.opacity = 0;
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowLeft') previousImage();
    if (event.code === 'ArrowRight') nextImage();
    if (event.code === 'Space') toggleSlideshow();
});

function previousImage() {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? images.length - 1 : 0);
    updateSlideshow();
}

function nextImage() {
    currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : (loop ? 0 : images.length - 1);
    updateSlideshow();
}

function preloadImages() {
    imageElements = [];
    for (let img of images) {
        let image = new Image();
        image.src = img;
        imageElements.push(image);
    }
}

function updateSlideshow() {
    let img = imageElements[currentIndex];
    let slideshow = document.getElementById('slideshow');
    slideshow.innerHTML = '';
    slideshow.appendChild(img);
    updateProgressBar();
    slideshow.style.opacity = 1;
}

document.getElementById('arrow-left').addEventListener('click', previousImage);
document.getElementById('arrow-right').addEventListener('click', nextImage);

document.getElementById('arrow-left').addEventListener('mouseover', function() {
    this.style.opacity = '1';
});

document.getElementById('arrow-right').addEventListener('mouseover', function() {
    this.style.opacity = '1';
});

document.getElementById('arrow-left').addEventListener('mouseout', function() {
    this.style.opacity = '0';
});

document.getElementById('arrow-right').addEventListener('mouseout', function() {
    this.style.opacity = '0';
});

function toggleSlideshow() {
    if (slideshowInterval) {
        stopSlideshow();
        document.getElementById('start').dataset.state = 'off';
        document.getElementById('stop').dataset.state = 'on';
    } else {
        startSlideshow();
        document.getElementById('start').dataset.state = 'on';
        document.getElementById('stop').dataset.state = 'off';
    }
}

// Event listener for fullscreen change
document.addEventListener('fullscreenchange', function() {
    isFullscreen = !!document.fullscreenElement;
    document.getElementById('progress-bar-container').style.display = (isFullscreen && isProgressBarVisible) ? 'block' : 'none';
});
