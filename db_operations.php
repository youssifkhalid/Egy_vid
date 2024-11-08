<?php
header("Content-Type: application/json");

$host = "127.0.0.1";
$username = "root";
$password = "root";
$database = "video_database";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

function sanitize($input) {
    global $conn;
    return $conn->real_escape_string($input);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = $_POST["action"];

    switch ($action) {
        case "add_video":
            $title = sanitize($_POST["title"]);
            $url = sanitize($_POST["url"]);
            $description = sanitize($_POST["description"]);
            $category = sanitize($_POST["category"]);
            $subcategory = sanitize($_POST["subcategory"]);
            $thumbnail = sanitize($_POST["thumbnail"]);

            $sql = "INSERT INTO videos (title, url, description, category, subcategory, thumbnail, rating) 
                    VALUES ('$title', '$url', '$description', '$category', '$subcategory', '$thumbnail', 0)";

            if ($conn->query($sql) === TRUE) {
                echo json_encode(["success" => true, "message" => "Video added successfully"]);
            } else {
                echo json_encode(["error" => "Error: " . $conn->error]);
            }
            break;

        case "delete_video":
            $id = sanitize($_POST["id"]);
            $sql = "DELETE FROM videos WHERE id = $id";

            if ($conn->query($sql) === TRUE) {
                echo json_encode(["success" => true, "message" => "Video deleted successfully"]);
            } else {
                echo json_encode(["error" => "Error: " . $conn->error]);
            }
            break;

        case "get_videos":
            $category = isset($_POST["category"]) ? sanitize($_POST["category"]) : "";
            $subcategory = isset($_POST["subcategory"]) ? sanitize($_POST["subcategory"]) : "";
            $search = isset($_POST["search"]) ? sanitize($_POST["search"]) : "";

            $sql = "SELECT * FROM videos WHERE 1=1";
            if ($category) {
                $sql .= " AND category = '$category'";
            }
            if ($subcategory) {
                $sql .= " AND subcategory = '$subcategory'";
            }
            if ($search) {
                $sql .= " AND title LIKE '%$search%'";
            }

            $result = $conn->query($sql);
            $videos = [];

            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $videos[] = $row;
                }
                echo json_encode(["success" => true, "videos" => $videos]);
            } else {
                echo json_encode(["success" => true, "videos" => []]);
            }
            break;

        case "get_video":
            $id = sanitize($_POST["id"]);
            $sql = "SELECT * FROM videos WHERE id = $id";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                $video = $result->fetch_assoc();
                echo json_encode(["success" => true, "video" => $video]);
            } else {
                echo json_encode(["error" => "Video not found"]);
            }
            break;

        case "update_rating":
            $id = sanitize($_POST["id"]);
            $rating = sanitize($_POST["rating"]);
            $sql = "UPDATE videos SET rating = $rating WHERE id = $id";

            if ($conn->query($sql) === TRUE) {
                echo json_encode(["success" => true, "message" => "Rating updated successfully"]);
            } else {
                echo json_encode(["error" => "Error: " . $conn->error]);
            }
            break;

        case "add_comment":
            $videoId = sanitize($_POST["videoId"]);
            $comment = sanitize($_POST["comment"]);
            $sql = "INSERT INTO comments (video_id, comment) VALUES ($videoId, '$comment')";

            if ($conn->query($sql) === TRUE) {
                echo json_encode(["success" => true, "message" => "Comment added successfully"]);
            } else {
                echo json_encode(["error" => "Error: " . $conn->error]);
            }
            break;

        case "get_comments":
            $videoId = sanitize($_POST["videoId"]);
            $sql = "SELECT * FROM comments WHERE video_id = $videoId ORDER BY created_at DESC";
            $result = $conn->query($sql);
            $comments = [];

            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $comments[] = $row;
                }
                echo json_encode(["success" => true, "comments" => $comments]);
            } else {
                echo json_encode(["success" => true, "comments" => []]);
            }
            break;

        default:
            echo json_encode(["error" => "Invalid action"]);
            break;
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

$conn->close();
?>