# Exporter Save Engine Diagram

This diagram displays the serialization workflow when exporting dirty registry objects back into PDF contents streams.

```mermaid
graph TD
    triggerExport[Export Document Trigger] --> getDirtyList[Query registry: get objects having isDirty == true]
    getDirtyList --> iterateObjects[Loop dirty objects]
    
    subgraph Coordinate Coordinate Transformation
        iterateObjects --> getInverseMatrix[Matrix.inverse: compute inverse CTM matrix]
        getInverseMatrix --> applyInverse[Map screen coordinates back to native PDF coordinates]
      end
    
    subgraph operator rewriting
        applyInverse --> locateContentStream[Find page operator index location]
        locateContentStream --> rebuildOperators[Rebuild Tj/TJ/cm PDF layout operators]
        rebuildOperators --> compressStream[Compress updated streams using FlateDecode]
      end
    
    compressStream --> rebuildXRef[Recompute XRef offset addresses table]
    rebuildXRef --> serializePDF[Serialize PDF byte streams to client file]
    serializePDF --> [*]
```
