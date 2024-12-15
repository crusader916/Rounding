document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    imageInput.id = 'imageInput';
    document.querySelector('.upload-container').appendChild(imageInput);

    const preview = document.getElementById('preview');
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const uploadButton = document.querySelector('.upload-button');

    uploadButton.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.src = event.target.result;
                preview.style.display = 'block';
                preview.style.borderRadius = radiusSlider.value + 'px';
                downloadBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    });

    radiusSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const percentage = (value / radiusSlider.max) * 100;
        radiusSlider.style.setProperty('--value', `${percentage}%`);
        radiusValue.textContent = value + 'px';
        preview.style.borderRadius = value + 'px';
    });

    radiusValue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            radiusValue.blur();
        }
    });

    radiusValue.addEventListener('blur', () => {
        let value = parseInt(radiusValue.textContent);
        
        if (isNaN(value)) {
            value = radiusSlider.value;
        } else {
            value = Math.min(Math.max(value, radiusSlider.min), radiusSlider.max);
        }
        
        radiusValue.textContent = value + 'px';
        radiusSlider.value = value;
        
        const percentage = (value / radiusSlider.max) * 100;
        radiusSlider.style.setProperty('--value', `${percentage}%`);
        
        preview.style.transition = 'border-radius 0.3s ease';
        preview.style.borderRadius = value + 'px';
    });

    downloadBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = preview.naturalWidth;
        canvas.height = preview.naturalHeight;
        
        ctx.beginPath();
        const radius = (radiusSlider.value / preview.width) * canvas.width;
        roundedImage(ctx, 0, 0, canvas.width, canvas.height, radius);
        ctx.clip();
        
        ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = 'rounded-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

function roundedImage(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}
