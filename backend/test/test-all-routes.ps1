# Comprehensive Route Testing Script
# Tests all API routes in the fuel management system

param(
    [string]$BaseUrl = "http://localhost:4001"
)

$ErrorActionPreference = "Continue"

Write-Host "=== Comprehensive Route Testing ===" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "Testing all available routes..." -ForegroundColor Gray
Write-Host ""

# Global variables
$authToken = ""
$testResults = @()

# Function to test route accessibility
function Test-Route {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Token = "",
        [bool]$RequiresAuth = $false,
        [string]$Description = ""
    )
    
    $uri = "$BaseUrl$Endpoint"
    $headers = @{
        'Content-Type' = 'application/json'
        'Accept' = 'application/json'
    }
    
    if ($RequiresAuth -and $Token) {
        $headers['Authorization'] = "Bearer $Token"
    }
    
    try {
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
            ErrorAction = 'Stop'
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params['Body'] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        Write-Host "[$Method] $Endpoint" -ForegroundColor Cyan -NoNewline
        if ($Description) {
            Write-Host " - $Description" -ForegroundColor Gray -NoNewline
        }
        
        $response = Invoke-RestMethod @params
        Write-Host " ✅" -ForegroundColor Green
        
        $script:testResults += @{
            Endpoint = $Endpoint
            Method = $Method
            Status = "SUCCESS"
            Description = $Description
            RequiresAuth = $RequiresAuth
        }
        
        return $response
    } catch {
        $statusCode = "Unknown"
        $errorMessage = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        
        if ($statusCode -eq 401 -and $RequiresAuth) {
            Write-Host " 🔒 (Auth Required)" -ForegroundColor Yellow
            $status = "AUTH_REQUIRED"
        } elseif ($statusCode -eq 404) {
            Write-Host " ❌ (Not Found)" -ForegroundColor Red
            $status = "NOT_FOUND"
        } elseif ($statusCode -eq 400) {
            Write-Host " ⚠️ (Bad Request)" -ForegroundColor Yellow
            $status = "BAD_REQUEST"
        } elseif ($statusCode -eq 403) {
            Write-Host " 🚫 (Forbidden)" -ForegroundColor Red
            $status = "FORBIDDEN"
        } else {
            Write-Host " ❌ ($statusCode)" -ForegroundColor Red
            $status = "ERROR"
        }
        
        $script:testResults += @{
            Endpoint = $Endpoint
            Method = $Method
            Status = $status
            StatusCode = $statusCode
            Error = $errorMessage
            Description = $Description
            RequiresAuth = $RequiresAuth
        }
        
        return $null
    }
}

# Test basic connectivity
Write-Host "=== Basic Connectivity Tests ===" -ForegroundColor Yellow
Test-Route -Method "GET" -Endpoint "/health" -Description "Health check"
Test-Route -Method "GET" -Endpoint "/api" -Description "API info"
Test-Route -Method "GET" -Endpoint "/api/v1" -Description "API v1 info"
Write-Host ""

# Test Authentication Routes
Write-Host "=== Authentication Routes (/api/v1/auth) ===" -ForegroundColor Yellow
Test-Route -Method "POST" -Endpoint "/api/v1/auth/register" -Description "User registration" -Body @{
    email = "test@example.com"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    phoneNumber = "+94771234567"
    nicNumber = "123456789V"
    userType = "VEHICLE_OWNER"
    address = @{
        addressLine1 = "123 Test Street"
        city = "Colombo"
        district = "COLOMBO"
        province = "WESTERN"
    }
}

Test-Route -Method "POST" -Endpoint "/api/v1/auth/login" -Description "User login" -Body @{
    email = "test@example.com"
    password = "Test123!"
}

Test-Route -Method "POST" -Endpoint "/api/v1/auth/logout" -RequiresAuth $true -Description "User logout"
Test-Route -Method "POST" -Endpoint "/api/v1/auth/refresh" -Description "Token refresh"
Test-Route -Method "POST" -Endpoint "/api/v1/auth/forgot-password" -Description "Forgot password" -Body @{
    email = "test@example.com"
}
Test-Route -Method "POST" -Endpoint "/api/v1/auth/reset-password" -Description "Reset password"
Test-Route -Method "GET" -Endpoint "/api/v1/auth/profile" -RequiresAuth $true -Description "Get user profile"
Test-Route -Method "PUT" -Endpoint "/api/v1/auth/profile" -RequiresAuth $true -Description "Update user profile"
Test-Route -Method "POST" -Endpoint "/api/v1/auth/change-password" -RequiresAuth $true -Description "Change password"
Write-Host ""

# Test Vehicle Routes
Write-Host "=== Vehicle Routes (/api/v1/vehicles) ===" -ForegroundColor Yellow
Test-Route -Method "POST" -Endpoint "/api/v1/vehicles/register" -RequiresAuth $true -Description "Register vehicle"
Test-Route -Method "POST" -Endpoint "/api/v1/vehicles/validate-dmt" -RequiresAuth $true -Description "Validate DMT"
Test-Route -Method "GET" -Endpoint "/api/v1/vehicles/registration/TEST-123" -RequiresAuth $true -Description "Get vehicle by registration"
Test-Route -Method "GET" -Endpoint "/api/v1/vehicles/test-id" -RequiresAuth $true -Description "Get vehicle by ID"
Test-Route -Method "POST" -Endpoint "/api/v1/vehicles/test-id/qr" -RequiresAuth $true -Description "Generate QR code"
Test-Route -Method "GET" -Endpoint "/api/v1/vehicles/qr/test-qr-code" -RequiresAuth $true -Description "Get vehicle by QR"
Test-Route -Method "GET" -Endpoint "/api/v1/vehicles/test-id/transactions" -RequiresAuth $true -Description "Get vehicle transactions"
Test-Route -Method "GET" -Endpoint "/api/v1/vehicles/test-id/quota" -RequiresAuth $true -Description "Check vehicle quota"
Write-Host ""

# Test Fuel Station Routes
Write-Host "=== Fuel Station Routes (/api/v1/fuel/stations) ===" -ForegroundColor Yellow
Test-Route -Method "GET" -Endpoint "/api/v1/fuel/stations" -RequiresAuth $true -Description "Get all fuel stations"
Test-Route -Method "POST" -Endpoint "/api/v1/fuel/stations" -RequiresAuth $true -Description "Create fuel station"
Test-Route -Method "GET" -Endpoint "/api/v1/fuel/stations/test-id" -RequiresAuth $true -Description "Get fuel station by ID"
Test-Route -Method "PUT" -Endpoint "/api/v1/fuel/stations/test-id" -RequiresAuth $true -Description "Update fuel station"
Test-Route -Method "DELETE" -Endpoint "/api/v1/fuel/stations/test-id" -RequiresAuth $true -Description "Delete fuel station"
Test-Route -Method "GET" -Endpoint "/api/v1/fuel/stations/search" -RequiresAuth $true -Description "Search fuel stations"
Write-Host ""

# Test Fuel Operator Routes
Write-Host "=== Fuel Operator Routes (/api/v1/fuel/operators) ===" -ForegroundColor Yellow
Test-Route -Method "GET" -Endpoint "/api/v1/fuel/operators" -RequiresAuth $true -Description "Get all operators"
Test-Route -Method "POST" -Endpoint "/api/v1/fuel/operators" -RequiresAuth $true -Description "Create operator"
Test-Route -Method "GET" -Endpoint "/api/v1/fuel/operators/test-id" -RequiresAuth $true -Description "Get operator by ID"
Test-Route -Method "PUT" -Endpoint "/api/v1/fuel/operators/test-id" -RequiresAuth $true -Description "Update operator"
Test-Route -Method "DELETE" -Endpoint "/api/v1/fuel/operators/test-id" -RequiresAuth $true -Description "Delete operator"
Write-Host ""

# Test Transaction Routes
Write-Host "=== Transaction Routes (/api/v1/transactions) ===" -ForegroundColor Yellow
Test-Route -Method "GET" -Endpoint "/api/v1/transactions" -RequiresAuth $true -Description "Get all transactions"
Test-Route -Method "POST" -Endpoint "/api/v1/transactions" -RequiresAuth $true -Description "Create transaction"
Test-Route -Method "GET" -Endpoint "/api/v1/transactions/test-id" -RequiresAuth $true -Description "Get transaction by ID"
Test-Route -Method "PUT" -Endpoint "/api/v1/transactions/test-id" -RequiresAuth $true -Description "Update transaction"
Test-Route -Method "DELETE" -Endpoint "/api/v1/transactions/test-id" -RequiresAuth $true -Description "Delete transaction"
Test-Route -Method "GET" -Endpoint "/api/v1/transactions/search" -RequiresAuth $true -Description "Search transactions"
Test-Route -Method "GET" -Endpoint "/api/v1/transactions/analytics" -RequiresAuth $true -Description "Transaction analytics"
Write-Host ""

# Test Admin Routes
Write-Host "=== Admin Routes (/api/v1/admin) ===" -ForegroundColor Yellow
Test-Route -Method "GET" -Endpoint "/api/v1/admin/dashboard" -RequiresAuth $true -Description "Admin dashboard"
Test-Route -Method "GET" -Endpoint "/api/v1/admin/users" -RequiresAuth $true -Description "Get all users"
Test-Route -Method "POST" -Endpoint "/api/v1/admin/users" -RequiresAuth $true -Description "Create user"
Test-Route -Method "GET" -Endpoint "/api/v1/admin/users/test-id" -RequiresAuth $true -Description "Get user by ID"
Test-Route -Method "PUT" -Endpoint "/api/v1/admin/users/test-id" -RequiresAuth $true -Description "Update user"
Test-Route -Method "DELETE" -Endpoint "/api/v1/admin/users/test-id" -RequiresAuth $true -Description "Delete user"
Test-Route -Method "GET" -Endpoint "/api/v1/admin/roles" -RequiresAuth $true -Description "Get all roles"
Test-Route -Method "POST" -Endpoint "/api/v1/admin/roles" -RequiresAuth $true -Description "Create role"
Test-Route -Method "GET" -Endpoint "/api/v1/admin/permissions" -RequiresAuth $true -Description "Get all permissions"
Test-Route -Method "GET" -Endpoint "/api/v1/admin/analytics" -RequiresAuth $true -Description "System analytics"
Write-Host ""

# Test Main Routes
Write-Host "=== Main Routes (/api/v1/main) ===" -ForegroundColor Yellow
Test-Route -Method "GET" -Endpoint "/api/v1/main" -Description "Main route info"
Test-Route -Method "GET" -Endpoint "/api/v1/main/status" -Description "System status"
Write-Host ""

# Generate Summary Report
Write-Host "=== Route Testing Summary ===" -ForegroundColor Green
Write-Host ""

$totalRoutes = $testResults.Count
$successfulRoutes = ($testResults | Where-Object { $_.Status -eq "SUCCESS" }).Count
$authRequiredRoutes = ($testResults | Where-Object { $_.Status -eq "AUTH_REQUIRED" }).Count
$notFoundRoutes = ($testResults | Where-Object { $_.Status -eq "NOT_FOUND" }).Count
$errorRoutes = ($testResults | Where-Object { $_.Status -eq "ERROR" }).Count

Write-Host "📊 Total Routes Tested: $totalRoutes" -ForegroundColor White
Write-Host "✅ Successful: $successfulRoutes" -ForegroundColor Green
Write-Host "🔒 Auth Required: $authRequiredRoutes" -ForegroundColor Yellow
Write-Host "❌ Not Found: $notFoundRoutes" -ForegroundColor Red
Write-Host "⚠️ Errors: $errorRoutes" -ForegroundColor Red
Write-Host ""

# Show detailed results by category
$groupedResults = $testResults | Group-Object Status

foreach ($group in $groupedResults) {
    $color = switch ($group.Name) {
        "SUCCESS" { "Green" }
        "AUTH_REQUIRED" { "Yellow" }
        "NOT_FOUND" { "Red" }
        "ERROR" { "Red" }
        "BAD_REQUEST" { "Yellow" }
        "FORBIDDEN" { "Red" }
        default { "White" }
    }
    
    Write-Host "$($group.Name) Routes ($($group.Count)):" -ForegroundColor $color
    foreach ($route in $group.Group) {
        Write-Host "  [$($route.Method)] $($route.Endpoint)" -ForegroundColor Gray
        if ($route.Description) {
            Write-Host "    $($route.Description)" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}

# Route Implementation Status
Write-Host "=== Implementation Recommendations ===" -ForegroundColor Cyan
Write-Host ""

if ($notFoundRoutes -gt 0) {
    Write-Host "🔧 Routes to Implement:" -ForegroundColor Yellow
    $testResults | Where-Object { $_.Status -eq "NOT_FOUND" } | ForEach-Object {
        Write-Host "  - [$($_.Method)] $($_.Endpoint)" -ForegroundColor Red
    }
    Write-Host ""
}

if ($authRequiredRoutes -gt 0) {
    Write-Host "🔐 Authentication Working:" -ForegroundColor Green
    Write-Host "  $authRequiredRoutes routes properly require authentication" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Implement missing routes (404 errors)" -ForegroundColor White
Write-Host "2. Set up proper authentication for testing protected routes" -ForegroundColor White
Write-Host "3. Test with valid data and authentication tokens" -ForegroundColor White
Write-Host "4. Verify business logic for each implemented route" -ForegroundColor White
Write-Host ""
Write-Host "Route testing completed! 🎉" -ForegroundColor Green
