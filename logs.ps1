$RENDER_KEY = "rnd_rqdbnUlXdmKSLGLjo0Tedh6Kxqni"
$SVC_ID = "srv-d6oqoic50q8c73auku4g"
$headers = @{ Authorization = "Bearer $RENDER_KEY"; Accept = "application/json" }

# Try log tail endpoint
$r = Invoke-WebRequest -Uri "https://api.render.com/v1/services/$SVC_ID/log-stream?limit=50&tail=50" -Headers $headers -TimeoutSec 10 -ErrorAction SilentlyContinue
if ($r) { Write-Host $r.Content }
