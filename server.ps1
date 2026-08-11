$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$port/")
$listener.Start()
Write-Host "Listening on port $port..."

$baseFolder = $PWD.Path

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath.Replace("/", "\")
    if ($urlPath -eq "\") { $urlPath = "\index.html" }
    
    $filePath = Join-Path $baseFolder $urlPath

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = "text/plain"
        switch ($ext) {
            ".html" { $contentType = "text/html" }
            ".css" { $contentType = "text/css" }
            ".js" { $contentType = "application/javascript" }
            ".png" { $contentType = "image/png" }
            ".jpg" { $contentType = "image/jpeg" }
            ".jpeg" { $contentType = "image/jpeg" }
            ".gif" { $contentType = "image/gif" }
            ".svg" { $contentType = "image/svg+xml" }
        }

        $response.ContentType = $contentType
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $message = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.ContentLength64 = $message.Length
        $response.OutputStream.Write($message, 0, $message.Length)
    }
    
    $response.Close()
}
