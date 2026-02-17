<?php
include 'db.php';

// Drop table if exists to start fresh on initialization (optional, comment out for safer incremental updates)
$mysqli->query("DROP TABLE IF EXISTS projects");

$sql = "CREATE TABLE IF NOT EXISTS projects (
    project_key VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($mysqli->query($sql) === TRUE) {
    echo "Table 'projects' created successfully.\n";
} else {
    echo "Error creating table: " . $mysqli->error . "\n";
}

// Initial Data Seed (Only if table is empty)
$result = $mysqli->query("SELECT COUNT(*) as count FROM projects");
$row = $result->fetch_assoc();

if ($row['count'] == 0) {
    // We can run app.js logic to save default projects via api.php or manually insert here.
    // Let's rely on the frontend to push initial data if empty, but for robustness:
    echo "Table is empty. The frontend will populate it.\n";
}

$mysqli->close();
?>
