xcopy src\*.js package\content\scripts /i
del *.nupkg
nuget\NuGet.exe pack package\MicroFramework.nuspec -Version %1