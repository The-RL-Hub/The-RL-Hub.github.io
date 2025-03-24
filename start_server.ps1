# Start a local HTTP server for testing The RL Hub website
# Run this script with PowerShell to start serving the website

$port = 8000 # Change this if port 8000 is in use
$url = "http://localhost:$port/"

Write-Host "Starting The RL Hub website server on $url" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

try {
    # Create the HTTP listener
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($url)
    $listener.Start()
    
    Write-Host "`nServer is running! Access the website at:" -ForegroundColor Cyan
    Write-Host "  $($url)index.html" -ForegroundColor Cyan
    Write-Host "`nAvailable pages:" -ForegroundColor Cyan
    Write-Host "  $($url)Pages/1-Introduction/intro.html" -ForegroundColor Cyan
    Write-Host "  $($url)Pages/2-Multi-armed-Bandits/mab.html" -ForegroundColor Cyan
    Write-Host "  $($url)Pages/chapter03/chapter03.html" -ForegroundColor Cyan
    Write-Host "  ... (and more)" -ForegroundColor Cyan
    
    # Keep the server running until Ctrl+C
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested file path
        $localPath = $request.Url.LocalPath.Replace("/", "\")
        if ($localPath -eq "\") {
            $localPath = "\index.html"
        }
        $localPath = "$PSScriptRoot$localPath"
        
        # Log the request
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "$timestamp - $($request.HttpMethod) $($request.Url.LocalPath)" -ForegroundColor Gray
        
        # Check if the file exists
        if (Test-Path $localPath -PathType Leaf) {
            # Get file content
            $content = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $content.Length
            
            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($localPath)
            switch ($extension) {
                ".html" { $response.ContentType = "text/html" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".json" { $response.ContentType = "application/json" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".gif"  { $response.ContentType = "image/gif" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                ".ico"  { $response.ContentType = "image/x-icon" }
                ".md"   { $response.ContentType = "text/markdown" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            # Write the response
            $output = $response.OutputStream
            $output.Write($content, 0, $content.Length)
            $output.Close()
        }
        else {
            # Return 404 if file not found
            $response.StatusCode = 404
            $notFoundMessage = "404 - File not found: $($request.Url.LocalPath)"
            $content = [System.Text.Encoding]::UTF8.GetBytes($notFoundMessage)
            $response.ContentLength64 = $content.Length
            $response.ContentType = "text/plain"
            $output = $response.OutputStream
            $output.Write($content, 0, $content.Length)
            $output.Close()
            
            Write-Host "  404 - File not found: $($request.Url.LocalPath)" -ForegroundColor Red
        }
        
        # Close the response
        $response.Close()
    }
}
finally {
    # Ensure the listener is stopped when the script ends
    if ($listener -ne $null) {
        $listener.Stop()
        $listener.Close()
        Write-Host "`nServer stopped." -ForegroundColor Yellow
    }
} 