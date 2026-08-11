$port = 8080
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()
Write-Host "Listening on port $port..."

$baseFolder = (Get-Item .).FullName

$pool = [runspacefactory]::CreateRunspacePool(1, 20)
$pool.Open()
$jobs = @()

$scriptBlock = {
    param($client, $baseFolder)
    try {
        $stream = $client.GetStream()
        
        $buffer = New-Object byte[] 8192
        $bytes = $stream.Read($buffer, 0, $buffer.Length)
        $requestString = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytes)
        
        $lines = $requestString -split "`r`n"
        if ($lines.Count -gt 0) {
            $firstLine = $lines[0]
            
            if ($firstLine -match "^(GET|POST|OPTIONS)\s+([^\s]+)") {
                $method = $matches[1]
                $urlPath = $matches[2].Split('?')[0]
                
                $contentLength = 0
                foreach ($line in $lines) {
                    if ($line -match "^Content-Length:\s*(\d+)") {
                        $contentLength = [int]$matches[1]
                    }
                }
                
                $body = ""
                $headerEnd = $requestString.IndexOf("`r`n`r`n")
                if ($headerEnd -ge 0) {
                    $headerEnd += 4
                    $bodyBytesRead = $bytes - $headerEnd
                    if ($bodyBytesRead -gt 0) {
                        $body = $requestString.Substring($headerEnd, $bodyBytesRead)
                    }
                    
                    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
                    while ($bodyBytes.Length -lt $contentLength -and $stream.DataAvailable) {
                        $bytes = $stream.Read($buffer, 0, $buffer.Length)
                        $bodyBytes += $buffer[0..($bytes-1)]
                    }
                    $body = [System.Text.Encoding]::UTF8.GetString($bodyBytes)
                }
                
                $corsHeaders = "Access-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`n"
                
                function Send-Response($json) {
                    $header = "HTTP/1.1 200 OK`r`n${corsHeaders}Content-Type: application/json`r`nCache-Control: no-store, no-cache, must-revalidate, max-age=0`r`nPragma: no-cache`r`nContent-Length: $($json.Length)`r`nConnection: close`r`n`r`n$json"
                    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                }
                
                if ($method -eq "OPTIONS") {
                    $header = "HTTP/1.1 200 OK`r`n${corsHeaders}Connection: close`r`n`r`n"
                    $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                    $stream.Write($headerBytes, 0, $headerBytes.Length)
                }
                elseif ($urlPath -eq "/api/checkout" -and $method -eq "POST") {
                    try {
                        $ordersFile = Join-Path $baseFolder "orders.json"
                        $orders = @()
                        if (Test-Path $ordersFile) {
                            $content = Get-Content $ordersFile -Raw
                            if (![string]::IsNullOrWhiteSpace($content)) {
                                $orders = $content | ConvertFrom-Json
                                if ($orders -isnot [array]) { $orders = @($orders) }
                            }
                        }
                        
                        $newOrder = $body | ConvertFrom-Json
                        $orderNum = 1000 + $orders.Count
                        $newOrder | Add-Member -Type NoteProperty -Name "id" -Value $orderNum
                        $newOrder | Add-Member -Type NoteProperty -Name "date" -Value (Get-Date -Format "o")
                        $newOrder | Add-Member -Type NoteProperty -Name "status" -Value "Pending"
                        
                        $orders += $newOrder
                        $orders | ConvertTo-Json -Depth 10 | Set-Content $ordersFile -Encoding utf8
                        
                        Send-Response '{"success":true,"orderId":"' + $orderNum + '"}'
                    } catch { Send-Response '{"success":false,"error":"Server error"}' }
                }
                elseif ($urlPath -eq "/api/orders" -and $method -eq "GET") {
                    $ordersFile = Join-Path $baseFolder "orders.json"
                    if (Test-Path $ordersFile) {
                        $content = Get-Content $ordersFile -Raw
                        Send-Response $content
                    } else {
                        Send-Response "[]"
                    }
                }
                elseif ($urlPath -eq "/api/settings" -and $method -eq "GET") {
                    $settingsFile = Join-Path $baseFolder "settings.json"
                    if (Test-Path $settingsFile) {
                        $content = Get-Content $settingsFile -Raw
                        Send-Response $content
                    } else {
                        Send-Response "{}"
                    }
                }
                elseif ($urlPath -eq "/api/admin/settings" -and $method -eq "POST") {
                    try {
                        $settingsFile = Join-Path $baseFolder "settings.json"
                        $body | Set-Content $settingsFile -Encoding utf8
                        Send-Response '{"success":true}'
                    } catch { Send-Response '{"success":false}' }
                }
                elseif ($urlPath -eq "/api/update_order_status" -and $method -eq "POST") {
                    try {
                        $req = $body | ConvertFrom-Json
                        $ordersFile = Join-Path $baseFolder "orders.json"
                        if (Test-Path $ordersFile) {
                            $orders = Get-Content $ordersFile -Raw | ConvertFrom-Json
                            if ($orders -isnot [array]) { $orders = @($orders) }
                            foreach ($o in $orders) {
                                if ([string]$o.id -eq [string]$req.orderId) {
                                    $o.status = $req.status
                                }
                            }
                            $orders | ConvertTo-Json -Depth 10 | Set-Content $ordersFile -Encoding utf8
                            Send-Response '{"success":true}'
                        } else { Send-Response '{"success":false}' }
                    } catch { Send-Response '{"success":false}' }
                }
                elseif ($urlPath -eq "/api/save_products" -and $method -eq "POST") {
                    try {
                        $newProducts = $body | ConvertFrom-Json
                        $jsonStr = $newProducts | ConvertTo-Json -Depth 10 -Compress
                        $jsContent = "const products = $jsonStr;"
                        Set-Content (Join-Path $baseFolder "js\data.js") -Value $jsContent -Encoding utf8
                        Send-Response '{"success":true}'
                    } catch { Send-Response '{"success":false}' }
                }
                elseif ($urlPath -eq "/api/auth" -and $method -eq "POST") {
                    try {
                        $req = $body | ConvertFrom-Json
                        if ($req.password -eq "admin123") {
                            Send-Response '{"success":true, "token":"auth-ok"}'
                        } else {
                            Send-Response '{"success":false}'
                        }
                    } catch { Send-Response '{"success":false}' }
                }
                elseif ($method -eq "GET") {
                    if ($urlPath -eq "/") { $urlPath = "/index.html" }
                    $urlPath = $urlPath.Replace("/", "\")
                    
                    $filePath = [System.IO.Path]::GetFullPath((Join-Path $baseFolder $urlPath))
                    
                    if ($filePath.StartsWith($baseFolder) -and (Test-Path $filePath -PathType Leaf)) {
                        if ($filePath.EndsWith("orders.json")) {
                            $header = "HTTP/1.1 403 Forbidden`r`nConnection: close`r`n`r`n403 Forbidden"
                            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                            $stream.Write($headerBytes, 0, $headerBytes.Length)
                        } else {
                            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                            $contentType = "text/plain"
                            switch ($ext) {
                                ".html" { $contentType = "text/html" }
                                ".css" { $contentType = "text/css" }
                                ".js" { $contentType = "application/javascript" }
                                ".png" { $contentType = "image/png" }
                                ".jpg" { $contentType = "image/jpeg" }
                                ".webp" { $contentType = "image/webp" }
                                ".json" { $contentType = "application/json" }
                                ".svg" { $contentType = "image/svg+xml" }
                            }
                            
                            $content = [System.IO.File]::ReadAllBytes($filePath)
                            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nCache-Control: no-store, no-cache, must-revalidate, max-age=0`r`nPragma: no-cache`r`nContent-Length: $($content.Length)`r`nConnection: close`r`n`r`n"
                            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                            
                            $stream.Write($headerBytes, 0, $headerBytes.Length)
                            $stream.Write($content, 0, $content.Length)
                        }
                    } else {
                        $header = "HTTP/1.1 404 Not Found`r`nConnection: close`r`n`r`n404 Not Found"
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                    }
                }
            }
        }
    } catch {
        # Silent fail
    } finally {
        if ($stream) { $stream.Close() }
        if ($client) { $client.Close() }
    }
}

while ($true) {
    if (!$listener.Pending()) {
        Start-Sleep -Milliseconds 5
        
        $jobs = @($jobs | Where-Object { $_.IsCompleted -eq $false })
        continue
    }
    
    $client = $listener.AcceptTcpClient()
    
    $ps = [powershell]::Create().AddScript($scriptBlock).AddArgument($client).AddArgument($baseFolder)
    $ps.RunspacePool = $pool
    $asyncResult = $ps.BeginInvoke()
    
    $jobs += [PSCustomObject]@{
        PowerShell = $ps
        AsyncResult = $asyncResult
        IsCompleted = $false
    }
    
    foreach ($job in $jobs) {
        if ($job.AsyncResult.IsCompleted) {
            $job.PowerShell.EndInvoke($job.AsyncResult)
            $job.PowerShell.Dispose()
            $job.IsCompleted = $true
        }
    }
}




