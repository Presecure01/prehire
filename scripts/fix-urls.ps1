# PreHire Frontend URL Fixer Script
# This script batch-replaces hardcoded localhost URLs with API configuration

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host "  PreHire Frontend URL Fixer" -ForegroundColor Cyan
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "c:\Users\shriv\Projects\Others\prehire-main\frontend\src"
$filesFixed = 0
$urlsReplaced = 0

# Files and their replacement patterns
$filesToFix = @(
    @{
        Path         = "$frontendPath\pages\RecruiterDashboardNewUI.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/recruiter/profile'"; New = "API_ENDPOINTS.RECRUITER.PROFILE" }
            @{ Old = "'http://localhost:5001/api/recruiter/shortlisted-profiles'"; New = "API_ENDPOINTS.RECRUITER.SHORTLISTED_PROFILES" }
        )
        Import       = "import apiClient, { API_ENDPOINTS } from '../utils/apiClient';"
    }
    @{
        Path         = "$frontendPath\pages\CandidateUploadResume.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/candidate/profile'"; New = "API_ENDPOINTS.CANDIDATE.PROFILE" }
            @{ Old = "'http://localhost:5001/api/upload/resume'"; New = "API_ENDPOINTS.UPLOAD.RESUME" }
            @{ Old = "'http://localhost:5001/api/candidate/resume-data'"; New = "API_ENDPOINTS.CANDIDATE.RESUME_DATA" }
            @{ Old = "'http://localhost:5001/api/candidate/resume'"; New = "API_ENDPOINTS.CANDIDATE.RESUME" }
            @{ Old = "'http://localhost:3001/api/parse-resume'"; New = "API_ENDPOINTS.AI.PARSE_RESUME" }
            @{ Old = "`http://localhost:5001"; New = "getApiUrl('"; OldSuffix = "`"; NewSuffix = "')" }
        )
        Import = "import apiClient, { API_ENDPOINTS, getApiUrl } from '.. / utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\CandidateResumeUpload.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/auth/linkedin'"; New = "getApiUrl('/api/auth/linkedin')" }
        )
        Import = "import { getApiUrl } from '../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\CandidateProfile.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/candidate/profile'"; New = "API_ENDPOINTS.CANDIDATE.PROFILE" }
            @{ Old = "`http://localhost:5001"; New = "getApiUrl('"; OldSuffix = "`"; NewSuffix = "')" 
            }
        )
        Import = "import apiClient, { API_ENDPOINTS, getApiUrl } from '../utils/apiClient';"
    }
    @{
        Path         = "$frontendPath\pages\CandidateEditProfile.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/candidate/profile'"; New = "API_ENDPOINTS.CANDIDATE.PROFILE" }
        )
        Import       = "import apiClient, { API_ENDPOINTS } from '../utils/apiClient';"
    }
    @{
        Path         = "$frontendPath\pages\CandidateDashboardNew.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/candidate/profile'"; New = "API_ENDPOINTS.CANDIDATE.PROFILE" }
            @{ Old = "`http://localhost:5001"; New = "getApiUrl('"; OldSuffix = "`"; NewSuffix = "')" }
        )
        Import = "import apiClient, { API_ENDPOINTS, getApiUrl } from '.. / utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\CandidateComplete.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/upload/photo'"; New = "API_ENDPOINTS.UPLOAD.PHOTO" }
            @{ Old = "'http://localhost:5001/api/upload/resume'"; New = "API_ENDPOINTS.UPLOAD.RESUME" }
            @{ Old = "'http://localhost:5001/api/auth/linkedin'"; New = "getApiUrl('/api/auth/linkedin')" }
        )
        Import = "import apiClient, { API_ENDPOINTS, getApiUrl } from '../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\candidate\PaymentSuccess.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/candidate/profile'"; New = "API_ENDPOINTS.CANDIDATE.PROFILE" }
        )
        Import = "import apiClient, { API_ENDPOINTS } from '../../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\candidate\AddBalance.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/candidate/wallet-balance'"; New = "API_ENDPOINTS.CANDIDATE.WALLET_BALANCE" }
        )
        Import = "import { API_ENDPOINTS } from '../../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\ATSScoreUpload.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/upload/resume'"; New = "API_ENDPOINTS.UPLOAD.RESUME" }
            @{ Old = "'http://localhost:5001/api/candidate/ats-score'"; New = "API_ENDPOINTS.CANDIDATE.ATS_SCORE" }
            @{ Old = "'http://localhost:3001/api/parse-resume'"; New = "API_ENDPOINTS.AI.PARSE_RESUME" }
            @{ Old = "`http://localhost:5001"; New = "getApiUrl('"; OldSuffix = "`"; NewSuffix = "')" 
            }
        )
        Import = "import apiClient, { API_ENDPOINTS, getApiUrl } from '../utils/apiClient';"
    }
    @{
        Path         = "$frontendPath\pages\ATSScoreResults.js"
        Replacements = @(
            @{ Old = "`http://localhost:5001"; New = "getApiUrl('"; OldSuffix = "`"; NewSuffix = "')" }
        )
        Import = "import { getApiUrl } from '.. / utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\AddProfiles.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/recruiter/shortlisted-profiles'"; New = "API_ENDPOINTS.RECRUITER.SHORTLISTED_PROFILES" }
            @{ Old = "`http://localhost:5001/api/recruiter/shortlisted-profiles/"; New = "`${API_ENDPOINTS.RECRUITER.SHORTLISTED_PROFILES}/" }
        )
        Import = "import apiClient, { API_ENDPOINTS } from '../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\AddPanelMember.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/recruiter/panel-members'"; New = "API_ENDPOINTS.RECRUITER.PANEL_MEMBERS" }
        )
        Import = "import { API_ENDPOINTS } from '../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\pages\AddBalance.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/recruiter/wallet-balance'"; New = "API_ENDPOINTS.RECRUITER.WALLET_BALANCE" }
        )
        Import = "import { API_ENDPOINTS } from '../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\components\SearchCandidates.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/recruiter/facets'"; New = "API_ENDPOINTS.RECRUITER.FACETS" }
            @{ Old = "`http://localhost:5001/api/recruiter/suggestions?q="; New = "`${API_ENDPOINTS.RECRUITER.SUGGESTIONS}?q=" }
            @{ Old = "`http://localhost:5001/api/recruiter/search?"; New = "`${API_ENDPOINTS.RECRUITER.SEARCH}?" }
        )
        Import = "import apiClient, { API_ENDPOINTS } from '../utils/apiClient';"
    }
    @{
        Path = "$frontendPath\components\ResumeUpload.js"
        Replacements = @(
            @{ Old = "'http://localhost:5001/api/upload/resume'"; New = "API_ENDPOINTS.UPLOAD.RESUME" }
            @{ Old = "'http://localhost:5001/api/candidate/resume-data'"; New = "API_ENDPOINTS.CANDIDATE.RESUME_DATA" }
            @{ Old = "http://localhost:3001/api/parse-resume'"; New = "API_ENDPOINTS.AI.PARSE_RESUME" }
        )
        Import = "import apiClient, { API_ENDPOINTS } from '../utils/apiClient'; "
    }
    @{
        Path = "$frontendPath\components\ProfileUnlock.js"
        Replacements = @(
            @{ Old = "`http://localhost:5001/api/recruiter/unlock-profile/"; New = "`${ API_ENDPOINTS.RECRUITER.UNLOCK_PROFILE }/" }
            @{ Old = "`http://localhost:5001"; New = "getApiUrl('"; OldSuffix = "`"; NewSuffix = "')" }
        )
        Import = "import apiClient, { API_ENDPOINTS, getApiUrl } from '../utils/apiClient'; "
    }
)

function Add-ImportIfMissing {
    param([string]$Content, [string]$Import, [string]$FilePath)
    
    # Check if already has this import
    if ($Content -match [regex]::Escape($Import)) {
        return $Content
    }
    
    # Check if has any import from apiClient
    if ($Content -match "from ['\`"].*\/apiClient['\`"]; ") {
        # Replace existing import
        $Content = $Content -replace "import .* from ['\`"].*\/apiClient['\`"]; ", $Import
    } else {
        # Add after other imports
        $lines = $Content -split "`n"
        $lastImportIndex = -1
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "^import ") {
                $lastImportIndex = $i
            }
        }
        
        if ($lastImportIndex -ge 0) {
            $lines = $lines[0..$lastImportIndex] + $Import + $lines[($lastImportIndex + 1)..($lines.Length - 1)]
            $Content = $lines -join "`n"
        }
    }
    
    return $Content
}

foreach ($fileInfo in $filesToFix) {
    $filePath = $fileInfo.Path
    
    if (-not (Test-Path $filePath)) {
        Write-Host "  [SKIP] $filePath (not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing: " -NoNewline
    Write-Host $filePath.Replace($frontendPath, "frontend\src") -ForegroundColor Cyan
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $originalContent = $content
    $fileUrlCount = 0
    
    # Add import if needed
    if ($fileInfo.Import) {
        $content = Add-ImportIfMissing -Content $content -Import $fileInfo.Import -FilePath $filePath
    }
    
    # Apply replacements
    foreach ($replacement in $fileInfo.Replacements) {
        $oldText = $replacement.Old
        if ($replacement.OldSuffix) {
            $pattern = [regex]::Escape($oldText) + "([^$($replacement.OldSuffix)]*)" + [regex]::Escape($replacement.OldSuffix)
            $newText = $replacement.New + "`$1" + $replacement.NewSuffix
            $matches = [regex]::Matches($content, $pattern)
            if ($matches.Count -gt 0) {
                $content = [regex]::Replace($content, $pattern, $newText)
                $fileUrlCount += $matches.Count
                Write-Host "    ✓ Replaced $($matches.Count) template literal(s)" -ForegroundColor Green
            }
        } else {
            $count = ([regex]::Matches($content, [regex]::Escape($oldText))).Count
            if ($count -gt 0) {
                $content = $content.Replace($oldText, $replacement.New)
                $fileUrlCount += $count
                Write-Host "    ✓ Replaced: $oldText" -ForegroundColor Green
            }
        }
    }
    
    if ($content -ne $originalContent) {
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would update file ($fileUrlCount URLs)" -ForegroundColor Yellow
        } else {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  [UPDATED] $fileUrlCount URL(s) fixed" -ForegroundColor Green
        }
        $filesFixed++
        $urlsReplaced += $fileUrlCount
    } else {
        Write-Host "  [NO CHANGE] File already fixed" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files processed: $($filesToFix.Count)" -ForegroundColor White
Write-Host "  Files fixed: $filesFixed" -ForegroundColor Green
Write-Host "  URLs replaced: $urlsReplaced" -ForegroundColor Green
if ($DryRun) {
    Write-Host "  Mode: DRY RUN (no changes made)" -ForegroundColor Yellow
}
Write-Host "=================================================================================`n" -ForegroundColor Cyan
