document.addEventListener('DOMContentLoaded', function() {
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');
    const ratingStars = document.querySelectorAll('.rating-star');

    const urlParams = new URLSearchParams(window.location.search);
    const videoId = parseInt(urlParams.get('id'));

    function loadVideo() {
        const formData = new FormData();
        formData.append('action', 'get_video');
        formData.append('id', videoId);

        fetch('db_operations.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const video = data.video;
                videoPlayer.src = `https://www.youtube.com/embed/${getYouTubeID(video.url)}`;
                videoTitle.textContent = video.title;
                videoDescription.textContent = video.description;
                updateRating(video.rating);
                loadComments();
            } else {
                console.error('Error loading video:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function updateRating(rating) {
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function loadComments() {
        const formData = new FormData();
        formData.append('action', 'get_comments');
        formData.append('videoId', videoId);

        fetch('db_operations.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayComments(data.comments);
            } else {
                console.error('Error loading comments:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function displayComments(comments) {
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const li = document.createElement('li');
            li.textContent = comment.comment;
            commentsList.appendChild(li);
        });
    }

    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const commentInput = document.getElementById('comment-input');
        const comment = commentInput.value.trim();

        if (comment) {
            const formData = new FormData();
            formData.append('action', 'add_comment');
            formData.append('videoId', videoId);
            formData.append('comment', comment);

            fetch('db_operations.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    commentInput.value = '';
                    loadComments();
                } else {
                    console.error('Error adding comment:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

    ratingStars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = index + 1;
            const formData = new FormData();
            formData.append('action', 'update_rating');
            formData.append('id', videoId);
            formData.append('rating', rating);

            fetch('db_operations.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateRating(rating);
                } else {
                    console.error('Error updating rating:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    loadVideo();
});

function getYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}