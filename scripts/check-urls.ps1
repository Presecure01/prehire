# URL Fix Helper Script for PreHire Frontend
# This script helps identify and document remaining hardcoded URLs

Write-Host "Scanning for hardcoded localhost URLs..." -ForegroundColor Yellow

$files = @(
    "RecruiterDashboardNewUI.js",
    "CandidateUploadResume.js", 
    "CandidateResumeUpload.js",
    "CandidateProfile.js",
    "CandidateEditProfile.js",
    "CandidateDashboardNew.js",
    "CandidateComplete.js",
    "ATSScoreUpload.js",
    "ATSScoreResults.js",
    "AddProfiles.js",
    "AddPanelMember.js",
    "AddBalance.js",
    "candidate\PaymentSuccess.js",
    "candidate\AddBalance.js"
)

$pagesPath = "c:\Users\shriv\Projects\Others\prehire-main\frontend\src\pages"

foreach ($file in $files) {
    $fullPath = Join-Path $pagesPath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $count = ([regex]::Matches($content, "http://localhost:5001")).Count
        $count += ([regex]::Matches($content, "http://localhost:3001")).Count
        
        if ($count -gt 0) {
            Write-Host "  $file : $count hardcoded URL(s)" -ForegroundColor Cyan
        }
    }
}

Write-Host "`nChecking components..." -ForegroundColor Yellow
$componentsPath = "c:\Users\shriv\Projects\Others\prehire-main\frontend\src\components"
$componentFiles = @("SearchCandidates.js", "ResumeUpload.js", "ProfileUnlock.js")

foreach ($file in $componentFiles) {
    $fullPath = Join-Path $componentsPath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $count = ([regex]::Matches($content, "http://localhost:5001")).Count
        $count += ([regex]::Matches($content, "http://localhost:3001")).Count
        
        if ($count -gt 0) {
            Write-Host "  $file : $count hardcoded URL(s)" -ForegroundColor Cyan
        }
    }
}

Write-Host "`nRecommendation:" -ForegroundColor Green
Write-Host "  1. Import: import apiClient, { API_ENDPOINTS, getApiUrl } from '../utils/apiClient';"
Write-Host "  2. Replace localhost:5001 URLs with API_ENDPOINTS.* or getApiUrl(path)"
Write-Host "  3. Replace localhost:3001 URLs with API_ENDPOINTS.AI.*"
