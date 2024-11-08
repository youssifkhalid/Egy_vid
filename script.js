document.addEventListener('DOMContentLoaded', function() {
    const videoGrid = document.getElementById('video-grid');
    const subcategoryButtons = document.querySelectorAll('.subcategory-btn');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    function displayVideos(subcategory = '', searchTerm = '') {
        videoGrid.innerHTML = '';
        const category = getCategoryFromPage();

        const formData = new FormData();
        formData.append('action', 'get_videos');
        formData.append('category', category);
        formData.append('subcategory', subcategory);
        formData.append('search', searchTerm);

        fetch('db_operations.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.videos.forEach(video => {
                    const videoCard = createVideoCard(video);
                    videoGrid.appendChild(videoCard);
                });
            } else {
                console.error('Error fetching videos:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function getCategoryFromPage() {
        const path = window.location.pathname;
        if (path.includes('movies')) return 'movies';
        if (path.includes('cartoons')) return 'cartoons';
        if (path.includes('sports')) return 'sports';
        return '';
    }

    function createVideoCard(video) {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.description.substring(0, 60)}...</p>
                <div class="video-rating">
                    ${'★'.repeat(video.rating)}${'☆'.repeat(5 - video.rating)}
                </div>
            </div>
        `;
        videoCard.addEventListener('click', () => {
            window.location.href = `video.html?id=${video.id}`;
        });
        return videoCard;
    }

    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        displayVideos('', searchTerm);
    });

    subcategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            subcategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const subcategory = this.dataset.category;
            displayVideos(subcategory);
        });
    });

    displayVideos();
});

function getYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}