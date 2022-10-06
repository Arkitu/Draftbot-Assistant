REM Do the same thing as init.sh but for Windows

@ECHO OFF

ECHO Creating missing directories…

IF NOT EXIST .\temp\ mkdir .\temp\

ECHO Missing directories created.
ECHO
ECHO Compoling typescript…

npx tsc

ECHO Typescript compiled.
ECHO
ECHO Project initialized !

PAUSE