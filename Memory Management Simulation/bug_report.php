<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $dbhost = "localhost";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "bug_reports";

    $conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);

    if ($conn->connect_error) {
        die("Connection to the database failed: " . $conn->connect_error);
    }

    $bug_description = isset($_POST['bug_description']) ? $_POST['bug_description'] : "";

    if (empty($bug_description) && (!isset($_FILES['bug_images']) || empty($_FILES['bug_images']['name'][0]))) {
        header("Location: Memory Management Simulation.html");
        exit;
    }

    $sql = "INSERT INTO bug_reports (bug_description, image_path) VALUES (?, ?)";

    if(isset($_FILES['bug_images']) && !empty($_FILES['bug_images']['name'][0])) {
        $image_paths = array();

        foreach($_FILES['bug_images']['tmp_name'] as $key => $tmp_name) {
            $image_name = $_FILES['bug_images']['name'][$key];
            $image_path = $_FILES['bug_images']['tmp_name'][$key];
            $image_extension = strtolower(pathinfo($image_name, PATHINFO_EXTENSION));
            $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif');

            if (in_array($image_extension, $allowed_extensions)) {
                $image_data = file_get_contents($image_path);
                $upload_directory = 'bug_images/';
                $image_upload_path = $upload_directory . $image_name;
                move_uploaded_file($image_path, $image_upload_path);

                $image_paths[] = $image_upload_path;
            } else {
                die("Unsupported image extension. Please upload images in formats: JPG, JPEG, PNG, or GIF.");
            }
        }

        foreach ($image_paths as $image_upload_path) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $bug_description, $image_upload_path);
            if ($stmt->execute()) {
                //echo "Bug report successfully saved.";
            } else {
                die("Error executing query: " . $stmt->error);
            }
            $stmt->close();
        }
    } else {

        $stmt = $conn->prepare($sql);
        $empty_string = "";
        $stmt->bind_param("ss", $bug_description, $empty_string);
        if ($stmt->execute()) {
            //echo "Bug report successfully saved.";
        } else {
            die("Error executing query: " . $stmt->error);
        }
        $stmt->close();
    }

    $conn->close();

    header("Location: Memory Management Simulation.html");
    exit;
}
?>