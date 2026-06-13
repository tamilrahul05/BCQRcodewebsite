document.addEventListener('DOMContentLoaded', () => {
    // Reveal header images when loaded and hide spinners (Images are now pre-cropped on server!)
    function setupHeaderImage(imgId, spinnerId, srcPath) {
        const img = document.getElementById(imgId);
        const spinner = document.getElementById(spinnerId);
        if (img && spinner) {
            img.onload = () => {
                img.classList.remove('hidden');
                spinner.classList.add('hidden');
            };
            img.onerror = () => {
                console.error("Failed to load header image:", srcPath);
                spinner.classList.add('hidden');
            };
            img.src = srcPath;
        }
    }

    setupHeaderImage('display-logo', 'spinner-logo', 'assets/logo.png');
    setupHeaderImage('display-baba', 'spinner-baba', 'assets/baba.png');

    // Official Social links config for Kolathur Babu Catering
    const links = {
        instagram: {
            url: "https://www.instagram.com/babucatering?igsh=MXZzMmJlcmNzM2Iybg==",
            filename: "kolathur-babu-catering-instagram-qr.png",
            title: "Instagram",
            subtitle: "@babucatering",
            iconClass: "fa-brands fa-instagram",
            boxClass: "instagram-box"
        },
        youtube: {
            url: "https://youtube.com/@kolathurbabucatering?si=VXKdkmFPu189_lx-",
            filename: "kolathur-babu-catering-youtube-qr.png",
            title: "YouTube",
            subtitle: "@kolathurbabucatering",
            iconClass: "fa-brands fa-youtube",
            boxClass: "youtube-box"
        },
        whatsapp: {
            url: "https://wa.me/919944769090",
            filename: "kolathur-babu-catering-whatsapp-qr.png",
            title: "WhatsApp",
            subtitle: "+91 99447 69090",
            iconClass: "fa-brands fa-whatsapp",
            boxClass: "whatsapp-box"
        },
        facebook: {
            url: "https://www.facebook.com/share/1GyxpPyBRZ/",
            filename: "kolathur-babu-catering-facebook-qr.png",
            title: "Facebook",
            subtitle: "Babu Catering",
            iconClass: "fa-brands fa-facebook-f",
            boxClass: "facebook-box"
        }
    };

    // QR Code generation options (high-res for printing/scanning)
    const qrOptions = {
        width: 800,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    };

    // Pre-generate all QR codes and cache their Data URLs
    const qrCache = {};

    Object.keys(links).forEach(platform => {
        const poolImg = document.getElementById(`qr-img-${platform}`);
        const url = links[platform].url;

        if (typeof QRCode !== 'undefined') {
            QRCode.toDataURL(url, qrOptions, (err, dataUrl) => {
                if (err) {
                    console.error(`Error generating QR for ${platform}:`, err);
                    return;
                }
                // Store in cache and update pool image
                qrCache[platform] = dataUrl;
                if (poolImg) {
                    poolImg.src = dataUrl;
                }
            });
        } else {
            console.error('QRCode library is not loaded');
        }
    });

    // Close all open dropdowns
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    // Toggle dropdown on menu-trigger click
    document.querySelectorAll('.menu-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid card click event
            
            const menu = trigger.nextElementSibling;
            const isOpen = menu.classList.contains('show');
            
            closeAllDropdowns();
            
            if (!isOpen) {
                menu.classList.add('show');
            }
        });
    });

    // Close dropdowns if clicking anywhere outside
    document.addEventListener('click', () => {
        closeAllDropdowns();
    });

    // Card Row Click (opens link directly)
    document.querySelectorAll('.link-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Do not trigger if user clicks the menu button or dropdown items
            if (e.target.closest('.menu-btn-wrapper')) {
                return;
            }
            const platform = card.getAttribute('data-platform');
            if (links[platform]) {
                window.open(links[platform].url, '_blank', 'noopener,noreferrer');
            }
        });
    });

    // Dropdown Items Clicks
    document.querySelectorAll('.link-card').forEach(card => {
        const platform = card.getAttribute('data-platform');
        const info = links[platform];
        if (!info) return;

        // 1. Show QR Code Option
        const optQr = card.querySelector('.opt-qr');
        if (optQr) {
            optQr.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllDropdowns();
                openQrModal(platform);
            });
        }

        // 2. Open Profile Option
        const optVisit = card.querySelector('.opt-visit');
        if (optVisit) {
            optVisit.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllDropdowns();
                window.open(info.url, '_blank', 'noopener,noreferrer');
            });
        }

        // 3. Download QR Option
        const optDownload = card.querySelector('.opt-download');
        if (optDownload) {
            optDownload.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllDropdowns();
                triggerQrDownload(platform);
            });
        }
    });

    // Modal elements
    const modal = document.getElementById('qr-modal');
    const modalClose = document.getElementById('modal-close');
    const modalIconBox = document.getElementById('modal-icon-box');
    const modalTitle = document.getElementById('modal-title');
    const modalQrImg = document.getElementById('modal-qr-img');
    const modalSpinner = document.getElementById('modal-spinner');
    const modalVisitBtn = document.getElementById('modal-visit-btn');
    const modalDownloadBtn = document.getElementById('modal-download-btn');

    let currentModalPlatform = null;

    // Open QR Code Modal
    function openQrModal(platform) {
        currentModalPlatform = platform;
        const info = links[platform];
        if (!info || !modal) return;

        // Configure Modal Header
        modalTitle.textContent = info.title;
        modalIconBox.className = `modal-platform-icon ${info.boxClass}`;
        modalIconBox.innerHTML = `<i class="${info.iconClass}"></i>`;

        // Load QR Code Image
        modalQrImg.classList.add('hidden');
        modalSpinner.classList.remove('hidden');

        // Check if QR code is cached
        const dataUrl = qrCache[platform];
        if (dataUrl) {
            modalQrImg.src = dataUrl;
            modalQrImg.classList.remove('hidden');
            modalSpinner.classList.add('hidden');
        } else {
            // Generate on the fly if not cached yet
            QRCode.toDataURL(info.url, qrOptions, (err, url) => {
                if (!err) {
                    qrCache[platform] = url;
                    modalQrImg.src = url;
                    modalQrImg.classList.remove('hidden');
                    modalSpinner.classList.add('hidden');
                }
            });
        }

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Lock body scroll
    }

    // Close Modal
    function closeQrModal() {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scroll
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeQrModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeQrModal();
            }
        });
    }

    // Modal Action Buttons
    if (modalVisitBtn) {
        modalVisitBtn.addEventListener('click', () => {
            if (currentModalPlatform && links[currentModalPlatform]) {
                window.open(links[currentModalPlatform].url, '_blank', 'noopener,noreferrer');
            }
        });
    }

    if (modalDownloadBtn) {
        modalDownloadBtn.addEventListener('click', () => {
            if (currentModalPlatform) {
                triggerQrDownload(currentModalPlatform);
            }
        });
    }

    // Standard Download Action
    function triggerQrDownload(platform) {
        const dataUrl = qrCache[platform];
        const info = links[platform];
        if (dataUrl && info) {
            const dlLink = document.createElement('a');
            dlLink.href = dataUrl;
            dlLink.download = info.filename;
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
        } else {
            alert('The QR code is still generating. Please try again in a few seconds.');
        }
    }
});
