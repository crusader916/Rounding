document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const previewWrapper = document.getElementById('previewWrapper');
    const controlsWrapper = document.getElementById('controlsWrapper');
    const exportOptions = document.getElementById('exportOptions');
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const controlPanels = document.querySelectorAll('.controls-panel');
    const presetButtons = document.querySelectorAll('.preset-button');
    const formatButtons = document.querySelectorAll('[data-format]');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    
    const topLeftSlider = document.getElementById('topLeftSlider');
    const topRightSlider = document.getElementById('topRightSlider');
    const bottomRightSlider = document.getElementById('bottomRightSlider');
    const bottomLeftSlider = document.getElementById('bottomLeftSlider');
    const topLeftValue = document.getElementById('topLeftValue');
    const topRightValue = document.getElementById('topRightValue');
    const bottomRightValue = document.getElementById('bottomRightValue');
    const bottomLeftValue = document.getElementById('bottomLeftValue');
    const linkCornersBtn = document.getElementById('linkCornersBtn');
    const randomCornersBtn = document.getElementById('randomCornersBtn');
    
    let currentImage = null;
    let cornersLinked = true;
    let selectedFormat = 'png';
    let imageQuality = 90;
    
    initParticles();

    const uploadButton = document.querySelector('.upload-button');
    uploadButton.addEventListener('click', () => imageInput.click());
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    currentImage = img;
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                    document.querySelector('.image-placeholder').style.display = 'none';

                    previewWrapper.style.display = 'block';
                    controlsWrapper.style.display = 'block';
                    exportOptions.style.display = 'block';
                    downloadBtn.disabled = false;

                    applyCornerRadius();
                    
                    const initRadius = parseInt(radiusSlider.value);
                    setAdvancedControlValues(initRadius);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
            
            showToast('Изображение успешно загружено!');
        }
    });

    radiusSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const percentage = (value / radiusSlider.max) * 100;
        radiusSlider.style.setProperty('--value', `${percentage}%`);
        radiusValue.textContent = value + 'px';

        if (cornersLinked) {
            setAdvancedControlValues(value);
        }
        
        applyCornerRadius();
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

        if (cornersLinked) {
            setAdvancedControlValues(value);
        }
        
        applyCornerRadius();
    });
    
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = parseInt(button.dataset.value);
            radiusSlider.value = value;
            radiusValue.textContent = value + 'px';
            
            const percentage = (value / radiusSlider.max) * 100;
            radiusSlider.style.setProperty('--value', `${percentage}%`);

            if (cornersLinked) {
                setAdvancedControlValues(value);
            }
            
            applyCornerRadius();
        });
    });
    
    const cornerSliders = [topLeftSlider, topRightSlider, bottomRightSlider, bottomLeftSlider];
    const cornerValues = [topLeftValue, topRightValue, bottomRightValue, bottomLeftValue];
    
    cornerSliders.forEach((slider, index) => {
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            const percentage = (value / slider.max) * 100;
            slider.style.setProperty('--value', `${percentage}%`);
            cornerValues[index].textContent = value + 'px';
            
            applyCornerRadius();
        });
    });
    
    cornerValues.forEach((valueEl, index) => {
        valueEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                valueEl.blur();
            }
        });
        
        valueEl.addEventListener('blur', () => {
            let value = parseInt(valueEl.textContent);
            
            if (isNaN(value)) {
                value = cornerSliders[index].value;
            } else {
                value = Math.min(Math.max(value, cornerSliders[index].min), cornerSliders[index].max);
            }
            
            valueEl.textContent = value + 'px';
            cornerSliders[index].value = value;
            
            const percentage = (value / cornerSliders[index].max) * 100;
            cornerSliders[index].style.setProperty('--value', `${percentage}%`);
            
            applyCornerRadius();
        });
    });
    
    linkCornersBtn.addEventListener('click', () => {
        cornersLinked = !cornersLinked;
        linkCornersBtn.classList.toggle('active');
        
        if (cornersLinked) {
            const mainRadius = parseInt(radiusSlider.value);
            setAdvancedControlValues(mainRadius);
            applyCornerRadius();
            showToast('Углы связаны!');
        } else {
            showToast('Углы независимы!');
        }
    });
    
    randomCornersBtn.addEventListener('click', () => {
        if (cornersLinked) {
            cornersLinked = false;
            linkCornersBtn.classList.remove('active');
        }
        
        cornerSliders.forEach((slider, index) => {
            const randomValue = Math.floor(Math.random() * parseInt(slider.max));
            slider.value = randomValue;
            cornerValues[index].textContent = randomValue + 'px';
            
            const percentage = (randomValue / slider.max) * 100;
            slider.style.setProperty('--value', `${percentage}%`);
        });
        
        applyCornerRadius();
        showToast('Случайные значения углов применены!');
    });
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            controlPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(`${tabId}Controls`).classList.add('active');
        });
    });

    formatButtons.forEach(button => {
        button.addEventListener('click', () => {
            formatButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            selectedFormat = button.dataset.format;
        });
    });

    qualitySlider.addEventListener('input', (e) => {
        imageQuality = e.target.value;
        qualityValue.textContent = imageQuality + '%';
    });

    resetBtn.addEventListener('click', () => {
        radiusSlider.value = 10;
        radiusValue.textContent = '10px';
        const percentage = (10 / radiusSlider.max) * 100;
        radiusSlider.style.setProperty('--value', `${percentage}%`);
        
        setAdvancedControlValues(10);
        
        cornersLinked = true;
        linkCornersBtn.classList.add('active');
        
        applyCornerRadius();
        showToast('Настройки сброшены!');
    });

    downloadBtn.addEventListener('click', () => {
        if (!currentImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = currentImage.naturalWidth;
        canvas.height = currentImage.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const topLeft = parseInt(topLeftSlider.value) / preview.width * canvas.width;
        const topRight = parseInt(topRightSlider.value) / preview.width * canvas.width;
        const bottomRight = parseInt(bottomRightSlider.value) / preview.width * canvas.width;
        const bottomLeft = parseInt(bottomLeftSlider.value) / preview.width * canvas.width;
        
        roundedRect(ctx, 0, 0, canvas.width, canvas.height, topLeft, topRight, bottomRight, bottomLeft);
        ctx.clip();
        
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        let mimeType;
        let fileName;
        
        switch (selectedFormat) {
            case 'jpg':
                mimeType = 'image/jpeg';
                fileName = 'rounded-image.jpg';
                break;
            case 'webp':
                mimeType = 'image/webp';
                fileName = 'rounded-image.webp';
                break;
            default:
                mimeType = 'image/png';
                fileName = 'rounded-image.png';
        }
        
        const quality = imageQuality / 100;
        link.href = canvas.toDataURL(mimeType, quality);
        link.download = fileName;
        link.click();
        
        showToast(`Изображение успешно скачано (${selectedFormat.toUpperCase()})!`);
    });
    
    copyBtn.addEventListener('click', async () => {
        if (!currentImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = currentImage.naturalWidth;
        canvas.height = currentImage.naturalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const topLeft = parseInt(topLeftSlider.value) / preview.width * canvas.width;
        const topRight = parseInt(topRightSlider.value) / preview.width * canvas.width;
        const bottomRight = parseInt(bottomRightSlider.value) / preview.width * canvas.width;
        const bottomLeft = parseInt(bottomLeftSlider.value) / preview.width * canvas.width;
        
        roundedRect(ctx, 0, 0, canvas.width, canvas.height, topLeft, topRight, bottomRight, bottomLeft);
        ctx.clip();
        
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Копируем в буфер обмена
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            
            showToast('Изображение скопировано в буфер обмена!');
        } catch (err) {
            showToast('Не удалось скопировать изображение!', 'error');
            console.error('Ошибка копирования:', err);
        }
    });
    
    function applyCornerRadius() {
        if (!preview.style.display || preview.style.display === 'none') return;
        
        const activePanel = document.querySelector('.controls-panel.active');
        
        if (activePanel.id === 'basicControls') {
            const radius = radiusSlider.value + 'px';
            preview.style.borderRadius = radius;
        } else {
            const topLeft = topLeftSlider.value + 'px';
            const topRight = topRightSlider.value + 'px';
            const bottomRight = bottomRightSlider.value + 'px';
            const bottomLeft = bottomLeftSlider.value + 'px';
            
            preview.style.borderRadius = `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
        }
    }

    function setAdvancedControlValues(value) {
        cornerSliders.forEach((slider, index) => {
            slider.value = value;
            cornerValues[index].textContent = value + 'px';
            
            const percentage = (value / slider.max) * 100;
            slider.style.setProperty('--value', `${percentage}%`);
        });
    }

    function roundedRect(ctx, x, y, width, height, topLeft, topRight, bottomRight, bottomLeft) {
        ctx.beginPath();
        
        ctx.moveTo(x + topLeft, y);
        ctx.lineTo(x + width - topRight, y);
        ctx.arcTo(x + width, y, x + width, y + topRight, topRight);
        
        ctx.lineTo(x + width, y + height - bottomRight);
        ctx.arcTo(x + width, y + height, x + width - bottomRight, y + height, bottomRight);
        
        ctx.lineTo(x + bottomLeft, y + height);
        ctx.arcTo(x, y + height, x, y + height - bottomLeft, bottomLeft);
        
        ctx.lineTo(x, y + topLeft);
        ctx.arcTo(x, y, x + topLeft, y, topLeft);
        
        ctx.closePath();
    }
    
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast';
        
        if (type !== 'success') {
            toast.classList.add(type);
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    function initParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            createParticle(particlesContainer);
        }
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.5 + 0.1;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = opacity;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
        
        container.appendChild(particle);
    }
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg); }
            50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg); }
            75% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
        }
    `;
    document.head.appendChild(styleSheet);
});
