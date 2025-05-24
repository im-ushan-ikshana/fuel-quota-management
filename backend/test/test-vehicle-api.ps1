# Vehicle API Test Script
# This script tests all vehicle management endpoints

$baseUrl = "http://localhost:4001/api/v1"
$authToken = ""

Write-Host "=== Vehicle API Testing Script ===" -ForegroundColor Green
Write-Host ""

# Function to make authenticated requests
function Invoke-AuthenticatedRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [hashtable]$Body = $null,
        [string]$Token = $authToken
    )
    
    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    if ($Token) {
        $headers['Authorization'] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body $bodyJson -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -ErrorAction Stop
        }
        return $response
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $responseBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseBody)
            $errorDetails = $reader.ReadToEnd()
            Write-Host "Response: $errorDetails" -ForegroundColor Red
        }
        return $null
    }
}

# Test 1: Health check
Write-Host "1. Testing health check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/../health" -Method GET
    Write-Host "✓ Health check passed" -ForegroundColor Green
    $healthResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Check if authentication is working
Write-Host "2. Testing authentication endpoint..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@test.com"
    password = "password123"
}

$loginResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$baseUrl/auth/login" -Body $loginBody -Token ""
if ($loginResponse -and $loginResponse.token) {
    $authToken = $loginResponse.token
    Write-Host "✓ Authentication successful" -ForegroundColor Green
    Write-Host "Token: $($authToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "✗ Authentication failed - creating test user..." -ForegroundColor Yellow
    
    # Try to register a test user
    $registerBody = @{
        email = "admin@test.com"
        password = "password123"
        firstName = "Admin"
        lastName = "User"
        phoneNumber = "+1234567890"
        userType = "ADMIN"
    }
    
    $registerResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$baseUrl/auth/register" -Body $registerBody -Token ""
    if ($registerResponse) {
        Write-Host "✓ Test user created" -ForegroundColor Green
        
        # Try login again
        $loginResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$baseUrl/auth/login" -Body $loginBody -Token ""
        if ($loginResponse -and $loginResponse.token) {
            $authToken = $loginResponse.token
            Write-Host "✓ Authentication successful after registration" -ForegroundColor Green
        }
    }
}
Write-Host ""

if (-not $authToken) {
    Write-Host "Cannot proceed without authentication token. Exiting..." -ForegroundColor Red
    exit 1
}

# Test 3: Register a new vehicle
Write-Host "3. Testing vehicle registration..." -ForegroundColor Yellow
$vehicleData = @{
    registrationNumber = "ABC-1234"
    chassisNumber = "CH123456789"
    engineNumber = "EN987654321"
    make = "Toyota"
    model = "Corolla"
    year = 2022
    fuelType = "PETROL"
    ownerName = "John Doe"
    ownerNIC = "123456789V"
    ownerAddress = "123 Main St, Colombo"
    ownerPhone = "+94771234567"
    dmtInfo = @{
        licenseNumber = "DMT-12345"
        expiryDate = "2025-12-31"
        isValid = $true
    }
    quotaLimit = 100
}

$registerResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$baseUrl/vehicles/register" -Body $vehicleData -Token $authToken
if ($registerResponse) {
    Write-Host "✓ Vehicle registration successful" -ForegroundColor Green
    $vehicleId = $registerResponse.vehicle.id
    Write-Host "Vehicle ID: $vehicleId" -ForegroundColor Gray
} else {
    Write-Host "✗ Vehicle registration failed" -ForegroundColor Red
}
Write-Host ""

# Test 4: Validate DMT
Write-Host "4. Testing DMT validation..." -ForegroundColor Yellow
$dmtValidationData = @{
    registrationNumber = "ABC-1234"
    chassisNumber = "CH123456789"
    dmtLicenseNumber = "DMT-12345"
}

$dmtResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$baseUrl/vehicles/validate-dmt" -Body $dmtValidationData -Token $authToken
if ($dmtResponse) {
    Write-Host "✓ DMT validation successful" -ForegroundColor Green
    $dmtResponse | ConvertTo-Json | Write-Host
} else {
    Write-Host "✗ DMT validation failed" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get vehicle by registration number
Write-Host "5. Testing get vehicle by registration..." -ForegroundColor Yellow
$getVehicleResponse = Invoke-AuthenticatedRequest -Method GET -Uri "$baseUrl/vehicles/registration/ABC-1234" -Token $authToken
if ($getVehicleResponse) {
    Write-Host "✓ Get vehicle by registration successful" -ForegroundColor Green
    Write-Host "Vehicle: $($getVehicleResponse.vehicle.make) $($getVehicleResponse.vehicle.model)" -ForegroundColor Gray
} else {
    Write-Host "✗ Get vehicle by registration failed" -ForegroundColor Red
}
Write-Host ""

# Test 6: Generate QR code
Write-Host "6. Testing QR code generation..." -ForegroundColor Yellow
if ($vehicleId) {
    $qrResponse = Invoke-AuthenticatedRequest -Method POST -Uri "$baseUrl/vehicles/$vehicleId/qr" -Token $authToken
    if ($qrResponse) {
        Write-Host "✓ QR code generation successful" -ForegroundColor Green
        Write-Host "QR Code Length: $($qrResponse.qrCode.Length) characters" -ForegroundColor Gray
    } else {
        Write-Host "✗ QR code generation failed" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Cannot test QR generation - no vehicle ID" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get vehicle transactions
Write-Host "7. Testing vehicle transactions..." -ForegroundColor Yellow
if ($vehicleId) {
    $transactionsResponse = Invoke-AuthenticatedRequest -Method GET -Uri "$baseUrl/vehicles/$vehicleId/transactions" -Token $authToken
    if ($transactionsResponse) {
        Write-Host "✓ Get vehicle transactions successful" -ForegroundColor Green
        Write-Host "Transactions count: $($transactionsResponse.transactions.Count)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Get vehicle transactions failed" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Cannot test transactions - no vehicle ID" -ForegroundColor Red
}
Write-Host ""

# Test 8: Check vehicle quota
Write-Host "8. Testing vehicle quota check..." -ForegroundColor Yellow
if ($vehicleId) {
    $quotaResponse = Invoke-AuthenticatedRequest -Method GET -Uri "$baseUrl/vehicles/$vehicleId/quota" -Token $authToken
    if ($quotaResponse) {
        Write-Host "✓ Vehicle quota check successful" -ForegroundColor Green
        Write-Host "Quota remaining: $($quotaResponse.quota.remaining)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Vehicle quota check failed" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Cannot test quota - no vehicle ID" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Testing Complete ===" -ForegroundColor Green
