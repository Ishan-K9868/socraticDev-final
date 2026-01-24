# Verify Relationships in Neo4j
Write-Host "Checking relationships in Neo4j..." -ForegroundColor Cyan
Write-Host ""

# Query to count relationships by type
$query = "MATCH ()-[r]->() RETURN type(r) AS relationship_type, count(r) AS count ORDER BY count DESC"

Write-Host "Running query: $query" -ForegroundColor Yellow
Write-Host ""

docker exec graphrag-neo4j cypher-shell -u neo4j -p password $query

Write-Host ""
Write-Host "If you see 0 or very few relationships, you need to re-upload your project!" -ForegroundColor Yellow
