# outdoorsBattlemapGenerator
Generator of outdoors battle-maps for tabletop RPGs

You can test it here: https://ajuc.github.io/outdoorsBattlemapGenerator/

The width and height have to be divisible by the grid size.

By default "autoupdate" is enabled - there are many optimizations to make it fast enough, but if you make the map too big so that the generation after each change is inconvenient - you can disable it. Then you have to click "redraw" button (which will turn red if there's anything to redraw). The full redraw caused by the button is significantly slower than autoupdate redraws which only redraw the layers that changed.

The generator has several configurable parts:
 - background grass generation (you can modify length of grass blades, density of the grass and "spread" which is explained later)
 - river generation (you only modify river size, 0=no river)
 - generating empty parts where no trees will grow (that's called "clearings" and you can configure their number and size - they are always circular and can overlap)
 - generating stones and twigs on the ground (you can configure their numbers - be aware that twigs won't be generated in the clearings)
 - generation of the trees (the most complex part, and vast majority of the configuration options are related to trees - you can specify number of trees, their size, and their type as well as many parameter of how they look like - type of tree is either multi-level trees or 1-level trees with scribbles inside, you can change how many steps the trees have, how random and how big the amplitude of serration in the tree border there are and many other parameters - I reccomend to play with them on a small map to get an intuition how it works)
 
 Export:
 
 If you just need the image - right-click on the image and "copy graphic" into a graphic editor of your choice, or "save graphic as".
 
 The generator also has export feature that exports to dungeondraft FoundryVTT format (.dd2vtt). After exporting you can import it in foundryVtt using a DungeonDraftImporter module - and it automaticaly imports the grid size, the background image and the line-of-sight blockers from the trees.
 
 The rectangular grid is exported correctly out of the box to .dd2vtt, hexagonal grid size is correct but foundryVtt is weird with its background image placing related to the hex grid so you will have to manually change the offset sometimes (for 1024x1024 map size and similar it mostly works OK but for much bigger or much smaller map sizes the grid drawn by foundryVtt is misaligned with the grid on the imported image - I'm working on it).
 
 
 
 Future plans:
  - several kinds of ground (using perlin noise to generate hills and valleys and including that in grass length and density calculation)
  - improve tree generation
  - try to add evergreen trees
  - roads (modify and generalize the river generation for that)
  - bridges (detected by simple intersection)
  - better rock generation
  - posibility for user to add sprites and have the generator spread them randomly on the clearings
  
  If you have any feedback feel free to contact me through github, on my gmail (ajuc00), or 
