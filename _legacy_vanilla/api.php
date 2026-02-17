<?php
header('Content-Type: application/json');
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // READ: Get all projects
    $sql = "SELECT * FROM projects ORDER BY priority"; // Or sort in JS
    // Actually, app.js sorts by priority, so simple select is fine.
    
    $result = $mysqli->query("SELECT data FROM projects");
    $projects = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // The JSON structure is stored in 'data' column
            $projects[] = json_decode($row['data']);
        }
    }
    
    echo json_encode($projects);

} elseif ($method === 'POST') {
    // SAVE: Replace all projects
    // Get raw POST data
    $json = file_get_contents('php://input');
    $projects = json_decode($json, true);
    
    if (!is_array($projects)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }
    
    // Begin transaction
    $mysqli->begin_transaction();
    
    try {
        // Clear existing data (Full state replacement model)
        $mysqli->query("DELETE FROM projects");
        
        $stmt = $mysqli->prepare("INSERT INTO projects (project_key, name, priority, data) VALUES (?, ?, ?, ?)");
        
        foreach ($projects as $proj) {
            $key = $proj['key'] ?? uniqid();
            $name = $proj['name'] ?? 'Unnamed';
            $priority = $proj['priority'] ?? 'medium';
            $data = json_encode($proj);
            
            $stmt->bind_param("ssss", $key, $name, $priority, $data);
            $stmt->execute();
        }
        
        $mysqli->commit();
        echo json_encode(['success' => true, 'count' => count($projects)]);
        
    } catch (Exception $e) {
        $mysqli->rollback();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$mysqli->close();
?>
