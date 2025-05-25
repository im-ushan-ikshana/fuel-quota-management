# Comprehensive Vehicle Route Testing Script
param(
    [string]$BaseUrl = "http://localhost:4001"
)

Write-Host "=== Vehicle Route Testing ===" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

# Get authentication token
Write-Host "=== Authentication ===" -ForegroundColor Yellow
$loginBody = @{
    email = "superadmin@example.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
    $token = $loginResult.data.accessToken
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Testing Vehicle DMT Validation ===" -ForegroundColor Yellow

# Test valid registration numbers
$validRegistrations = @("ABC-1234", "XYZ-5678", "DEF-9012")
foreach ($regNumber in $validRegistrations) {
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/v1/vehicles/validate-dmt?registrationNumber=$regNumber" -Method GET -Headers $headers
        Write-Host "✅ $regNumber - Valid" -ForegroundColor Green
        Write-Host "   Owner: $($result.data.validationData.ownerName)" -ForegroundColor Gray
        Write-Host "   Chassis: $($result.data.validationData.chassisNumber)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ $regNumber - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test invalid registration numbers
Write-Host "`n=== Testing Invalid Registration Numbers ===" -ForegroundColor Yellow
$invalidRegistrations = @("TEST-123", "INVALID-456", "FAKE-789")
foreach ($regNumber in $invalidRegistrations) {
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/v1/vehicles/validate-dmt?registrationNumber=$regNumber" -Method GET -Headers $headers
        Write-Host "❌ $regNumber - Should have failed but returned success" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq "NotFound") {
            Write-Host "✅ $regNumber - Correctly returns 404 NotFound" -ForegroundColor Green
        } else {
            Write-Host "❌ $regNumber - Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

# Test missing parameter
Write-Host "`n=== Testing Missing Parameters ===" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/v1/vehicles/validate-dmt" -Method GET -Headers $headers
    Write-Host "❌ Missing registrationNumber - Should have failed" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq "BadRequest") {
        Write-Host "✅ Missing registrationNumber - Correctly returns 400 BadRequest" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing registrationNumber - Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing Other Vehicle Routes ===" -ForegroundColor Yellow

# Test vehicle registration endpoint (POST)
try {
    $vehicleData = @{
        registrationNumber = "NEW-1234"
        chassisNumber = "CH123456789"
        engineNumber = "EN987654321"
        make = "Toyota"
        model = "Prius"
        vehicleType = "CAR"
        fuelType = "PETROL_92_OCTANE"
        monthlyQuotaLimit = 100
        ownerId = "cm40tj3ob0000djh8ai7vctvd"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$BaseUrl/api/v1/vehicles/register" -Method POST -Body $vehicleData -Headers $headers
    Write-Host "✅ Vehicle registration - Success" -ForegroundColor Green
} catch {
    Write-Host "❌ Vehicle registration - Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n=== Vehicle Route Testing Complete! ===" -ForegroundColor Green
