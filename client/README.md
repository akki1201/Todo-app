Get-ChildItem -Recurse -File | Where-Object { 
     $_.FullName -notmatch "node_modules|\.git|dist|build|uploads|scripts|README.md" -and 
     $_.Extension -notmatch "\.png|\.jpg|\.jpeg|\.gif|\.svg|\.log|\.pdf" -and
     $_.Name -notmatch "package-lock|yarn\.lock|\.env"
 } | ForEach-Object {
     "========================================" | Out-File "code.txt" -Append
     "FILE: $($_.FullName.Replace($PWD.Path + '\', ''))" | Out-File "code.txt" -Append
     "========================================" | Out-File "code.txt" -Append
     "" | Out-File "code.txt" -Append
     Get-Content $_.FullName -Raw | Out-File "code.txt" -Append
     "" | Out-File "code.txt" -Append
     "" | Out-File "code.txt" -Append
     Write-Host "✓ $($_.Name)" -ForegroundColor Green
 }
 Write-Host "n✅ DONE! Check code.txt"



 adarshkishaadi@gmail.com