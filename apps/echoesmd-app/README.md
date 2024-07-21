## Roadmap
- ### v1
  <!-- - Be able to remove group unless there only is one group -->
  <!-- - Trash folders  -->
  Style trash page
- ### Release
  - Better server and authentication
  - Remember Vault groups
  - Better groups, drag and drop, new Windows, change size of group window
  - Move vault store to echoes store
  - Plugin support
  - Import Export

- ### Refactors
  - Instance
    - Dont store items. When getting files / tree / trash get them from Vault (item-page-meta)
      - This will allow for deep observer to only emit depending on what changes were made.
    - Add methods
      - GetFilesFromParent: Will get all files under that parent (including grand-children)
      - GetFilesFromKeyValue: Will get all files with a specific key value pair
    - Remove methods
  - Vue
    - Load item when component loads, not when pressing the tab. Unload item when component unmounts
    - Store all vaults in echoes store and persist which tabs are open. Above is prerequisite since this will just  keep a copy of the item.