#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

::peicon::
Send <link rel="icon" href="pelement.png">
return

::font_roboto::
Send <link href="https://fonts.googleapis.com/css?family=Roboto:300,700" rel="stylesheet" type="text/css">
return

::<html>::
Send <!DOCTYPE html>{Enter}<html>{Enter}  <head>{Enter}  <title></title>{Enter}<link rel="icon" href="pelement.png">{Enter}<link href="https://fonts.googleapis.com/css?family=Roboto:300,700" rel="stylesheet" type="text/css">{Enter}{Enter}<style>{Enter}  body{{}{Enter}  background-color:white;{Enter}margin:0;{Enter}{BS}{}}{Enter}{BS}</style>{Enter}<script></script>{Enter}{BS}</head>{Enter}<body>{Enter}{Enter}</body>{Enter}{BS}</html>
return
