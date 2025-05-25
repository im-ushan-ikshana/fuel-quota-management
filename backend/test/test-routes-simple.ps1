# Comprehensive Route Testing Script
param(
    [string]$BaseUrl = "http://localhost:4001"
)

Write-Host "=== Fuel Quota Management System - Route Testing ===" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

# Step 1: Test basic endpoints
Write-Host "=== Testing Basic Endpoints ===" -ForegroundColor Yellow
try {
    $apiInfo = Invoke-RestMethod -Uri "$BaseUrl/api" -Method GET
    Write-Host "✅ GET /api - Success" -ForegroundColor Green
    Write-Host "   Message: $($apiInfo.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api - Failed" -ForegroundColor Red
}

try {
    $v1Info = Invoke-RestMethod -Uri "$BaseUrl/api/v1" -Method GET
    Write-Host "✅ GET /api/v1 - Success" -ForegroundColor Green
    Write-Host "   Message: $($v1Info.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/v1 - Failed" -ForegroundColor Red
}

try {
    $mainInfo = Invoke-RestMethod -Uri "$BaseUrl/api/v1/main" -Method GET
    Write-Host "✅ GET /api/v1/main - Success" -ForegroundColor Green
    Write-Host "   Message: $($mainInfo.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/v1/main - Failed" -ForegroundColor Red
}

try {
    $statusInfo = Invoke-RestMethod -Uri "$BaseUrl/api/v1/main/status" -Method GET
    Write-Host "✅ GET /api/v1/main/status - Success" -ForegroundColor Green
    Write-Host "   Status: $($statusInfo.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET /api/v1/main/status - Failed" -ForegroundColor Red
}

# Step 2: Test authentication
Write-Host "`n=== Testing Authentication ===" -ForegroundColor Yellow

# Login as super admin
$loginBody = @{
    email = "superadmin@example.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ POST /api/v1/auth/login - Success" -ForegroundColor Green
    $token = $loginResult.data.accessToken
    Write-Host "   User: $($loginResult.data.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST /api/v1/auth/login - Failed" -ForegroundColor Red
    exit 1
}

# Step 3: Test protected routes
Write-Host "`n=== Testing Protected Routes ===" -ForegroundColor Yellow

$headers = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Test auth verification
try {
    $verifyResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/verify-token" -Method GET -Headers $headers
    Write-Host "✅ GET /api/v1/auth/verify-token - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/v1/auth/verify-token - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test admin routes
try {
    $adminResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/admin" -Method GET -Headers $headers
    Write-Host "✅ GET /api/v1/admin - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/v1/admin - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

try {
    $usersResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/admin/users" -Method GET -Headers $headers
    Write-Host "✅ GET /api/v1/admin/users - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/v1/admin/users - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

try {
    $rolesResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/admin/roles" -Method GET -Headers $headers
    Write-Host "✅ GET /api/v1/admin/roles - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/v1/admin/roles - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test vehicle routes
try {
    $dmtResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/vehicles/validate-dmt?registrationNumber=TEST-123" -Method GET -Headers $headers
    Write-Host "✅ GET /api/v1/vehicles/validate-dmt - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/v1/vehicles/validate-dmt - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test fuel station routes
try {
    $stationsResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/fuel/stations" -Method GET -Headers $headers
    Write-Host "✅ GET /api/v1/fuel/stations - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/v1/fuel/stations - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

# Test transaction routes
try {
    $transactionsResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/transactions" -Method GET -Headers $headers
    Write-Host "✅ GET /api/v1/transactions - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ GET /api/v1/transactions - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`n=== Route Testing Complete! ===" -ForegroundColor Green
Write-Host "All major routes have been tested." -ForegroundColor White
