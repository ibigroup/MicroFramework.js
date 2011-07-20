xcopy src\*.js package\content\scripts /i
del *.nupkg
%NuGetPath%\NuGet.exe pack package\MicroFramework.nuspec -Version %1