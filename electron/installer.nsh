; Kali NSIS customisations.

; A stale uninstall entry can make the installer wait forever at
; "Installing, please wait..." after a partial install or a manual folder
; deletion. Remove the entry only when the uninstaller is not on disk.
!macro customInit
  IfFileExists "$INSTDIR\${UNINSTALL_FILENAME}" kali_stale_registry_done
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}"
  kali_stale_registry_done:
!macroend
