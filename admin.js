document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');
    const adminPanel = document.getElementById('admin-panel');
    const uploadForm = document.getElementById('upload-form');
    const categorySelect = document.getElementById('video-category');
    const subcategorySelect = document.getElementById('video-subcategory');
    const videoManagement = document.getElementById('video-management');

    const ADMIN_PHONE = '01092812463';
    const ADMIN_PASSWORD = 'Aa123456#';

    const subcategories = {
        movies: ['comedy', 'horror', 'new', 'old', 'foreign'],
        cartoons: [],
        sports: ['matches', 'live']
    };

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
            document.getElementById('login-form').style.display = 'none';
            adminPanel.style.display = 'block';
            displayVideos();
        } else {
            alert('رقم الهاتف أو كلمة المرور غير صحيحة');
        }
    });

    categorySelect.addEventListener('change', function() {
        const category = this.value;
        subcategorySelect.innerHTML = '<option value="">اختر التصنيف الفرعي</option>';
        
        if (subcategories[category]) {
            subcategories[category].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subcategorySelect.appendChild(option);
            });
        }
    });

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('action', 'add_video');
        formData.append('title', document.getElementById('video-title').value);
        formData.append('url', document.getElementById('video-url').value);
        formData.append('description', document.getElementById('video-description').value);
        formData.append('category', categorySelect.value);
        formData.append('subcategory', subcategorySelect.value);
        formData.append('thumbnail', `https://img.youtube.com/vi/${getYouTubeID(document.getElementById('video-url').value)}/0.jpg`);

        fetch('db_operations.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم رفع الفيديو بنجاح!');
                uploadForm.reset();
                displayVideos();
            } else {
                alert('حدث خطأ أثناء رفع الفيديو: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('حدث خطأ أثناء رفع الفيديو');
        });
    });

    function displayVideos() {
        videoManagement.innerHTML = '';
        
        const formData = new FormData();
        formData.append('action', 'get_videos');

        fetch('db_operations.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.videos.forEach(video => {
                    const videoElement = document.createElement('div');
                    videoElement.className = 'video-item';
                    videoElement.innerHTML = `
                        <img src="${video.thumbnail}" alt="${video.title}" style="width: 120px; height: 90px; object-fit: cover;">
                        <h3>${video.title}</h3>
                        <p>الفئة: ${video.category}</p>
                        <p>التصنيف الفرعي: ${video.subcategory || 'غير محدد'}</p>
                        <button onclick="deleteVideo(${video.id})">حذف</button>
                        <a href="${video.url}" target="_blank">مشاهدة</a>
                    `;
                    videoManagement.appendChild(videoElement);
                });
            } else {
                console.error('Error fetching videos:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    window.deleteVideo = function(id) {
        const formData = new FormData();
        formData.append('action', 'delete_video');
        formData.append('id', id);

        fetch('db_operations.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayVideos();
            } else {
                alert('حدث خطأ أثناء حذف الفيديو: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('حدث خطأ أثناء حذف الفيديو');
        });
    };

    displayVideos();
});

function getYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}