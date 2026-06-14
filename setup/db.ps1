# Lance les commandes Prisma depuis la racine du projet.
# Usage : .\db.ps1 migrate | generate | deploy | studio | push

param(
  [Parameter(Position = 0)]
  [ValidateSet("migrate", "generate", "deploy", "studio", "push")]
  [string]$Command = "migrate"
)

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

switch ($Command) {
  "migrate" { npm run db:migrate }
  "generate" { npm run db:generate }
  "deploy" { npm run db:migrate:deploy }
  "studio" { npm run db:studio }
  "push" { npm run db:push }
}
